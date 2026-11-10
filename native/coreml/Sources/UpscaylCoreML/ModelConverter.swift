import Foundation

struct ConvertedModel {
    let bytes: [UInt8]
    let inputName: String
    let outputName: String
    /// how many times the model enlarges an image
    let scale: Int
}

/// Rewrites an ncnn graph as a Core ML neural network: spec version 6, fp16 weights, one fixed tile size.
/// Field numbers are the ones from coremltools (Model.proto, NeuralNetwork.proto).
///
/// This is the old "neuralnetwork" format. The newer mlprogram one would need MIL written by hand. If a future
/// macOS stops compiling it, the compile step throws and the app falls back to ncnn.
final class ModelConverter {
    /// What we know about a blob while walking the graph.
    private struct Shape {
        var channels: Int
        /// how many times wider the blob is than the network input
        var zoom: Int
    }

    private let model: NCNNModel
    private let tileSize: Int
    private var weightReader: WeightReader
    private var encodedLayers: [[UInt8]] = []
    private var shapes: [String: Shape] = [:]
    private var aliases: [String: String] = [:]
    private var inputName: String?
    private var lastOutput: String?

    init(model: NCNNModel, tileSize: Int) {
        self.model = model
        self.tileSize = tileSize
        weightReader = WeightReader(model.weights)
    }

    func convert() throws -> ConvertedModel {
        for layer in model.layers {
            try add(layer)
        }
        guard weightReader.atEnd else {
            throw UnsupportedError("weight file is longer than the graph")
        }
        guard let inputName, let outputName = lastOutput, let outputShape = shapes[outputName],
            outputShape.channels == 3, outputShape.zoom >= 1
        else {
            throw UnsupportedError("graph does not end in a 3 channel image")
        }
        let bytes = specification(inputName: inputName, outputName: outputName, scale: outputShape.zoom)
        return ConvertedModel(bytes: bytes, inputName: inputName, outputName: outputName, scale: outputShape.zoom)
    }

    // MARK: Walking the graph

    private func add(_ layer: NCNNLayer) throws {
        switch layer.type {
        case "Input":
            guard let name = layer.outputs.first, inputName == nil else {
                throw UnsupportedError("graph needs exactly one input")
            }
            inputName = name
            shapes[name] = Shape(channels: 3, zoom: 1)
            return
        case "Split":
            // a split only gives the same blob another name
            guard let source = layer.inputs.first else {
                throw UnsupportedError("split \(layer.name) has no input")
            }
            for name in layer.outputs {
                aliases[name] = resolve(source)
            }
            return
        default:
            break
        }

        let inputs = layer.inputs.map(resolve)
        guard let output = layer.outputs.first, let first = inputs.first, let inputShape = shapes[first] else {
            throw UnsupportedError("layer \(layer.name) has no usable input")
        }

        var shape = inputShape
        switch layer.type {
        case "Convolution":
            shape.channels = try convolution(layer, input: first, output: output, inputChannels: inputShape.channels)
        case "ReLU":
            activation(layer.name, input: first, output: output, slope: layer.double(0, 0))
        case "PReLU":
            try prelu(layer, input: first, output: output, channels: inputShape.channels)
        case "PixelShuffle":
            let block = try pixelShuffle(layer, input: first, output: output, channels: inputShape.channels)
            shape.channels = inputShape.channels / (block * block)
            shape.zoom *= block
        case "Concat":
            shape.channels = try concat(layer, inputs: inputs, output: output)
        case "Eltwise":
            try eltwise(layer, inputs: inputs, output: output)
        case "BinaryOp":
            try binaryOp(layer, inputs: inputs, output: output)
        case "Interp":
            shape.zoom *= try interp(layer, input: first, output: output)
        default:
            throw UnsupportedError("layer type \(layer.type)")
        }

        shapes[output] = shape
        lastOutput = output
    }

    private func resolve(_ blob: String) -> String {
        var name = blob
        while let next = aliases[name] {
            name = next
        }
        return name
    }

    // MARK: Layers

    /// Returns the number of output channels.
    private func convolution(_ layer: NCNNLayer, input: String, output: String, inputChannels: Int) throws -> Int {
        // ncnn parameter ids: 0 output channels, 1 kernel, 2 dilation, 3 stride, 4 left pad, 5 has bias,
        // 6 weight count, 7 groups, 8 int8 scale, 9 activation, 10 activation params, 11 kernel height,
        // 12 dilation height, 13 stride height, 14 top pad, 15 right pad, 16 bottom pad, 18 pad value
        let outputChannels = layer.int(0, 0)
        let kernel = layer.int(1, 0)
        let weightCount = layer.int(6, 0)
        guard outputChannels > 0, kernel > 0, layer.int(11, kernel) == kernel else {
            throw UnsupportedError("convolution \(layer.name): kernel")
        }
        guard layer.int(2, 1) == 1, layer.int(12, 1) == 1, layer.int(3, 1) == 1, layer.int(13, 1) == 1 else {
            throw UnsupportedError("convolution \(layer.name): stride or dilation")
        }
        guard layer.int(7, 1) == 1, layer.int(8, 0) == 0, layer.int(18, 0) == 0 else {
            throw UnsupportedError("convolution \(layer.name): groups or int8")
        }
        let padLeft = layer.int(4, 0)
        let padTop = layer.int(14, padLeft)
        let padRight = layer.int(15, padLeft)
        let padBottom = layer.int(16, padTop)
        guard padLeft >= 0, padTop >= 0, padRight >= 0, padBottom >= 0 else {
            throw UnsupportedError("convolution \(layer.name): padding mode")
        }
        guard weightCount % (outputChannels * kernel * kernel) == 0 else {
            throw UnsupportedError("convolution \(layer.name): weight size")
        }
        let weightInputChannels = weightCount / (outputChannels * kernel * kernel)
        guard weightInputChannels == inputChannels else {
            throw UnsupportedError("convolution \(layer.name): channel mismatch")
        }

        let weights = try weightReader.weights(weightCount)
        let bias = layer.int(5, 0) != 0 ? try weightReader.rawValues(outputChannels) : Data(count: outputChannels * 2)
        let activationType = layer.int(9, 0)
        let convolutionOutput = activationType == 0 ? output : output + "_pre"

        emit(layer.name, inputs: [input], output: convolutionOutput) { message in
            message.message(100) { conv in
                conv.uint(1, outputChannels)
                conv.uint(2, weightInputChannels)
                conv.uint(10, 1)
                conv.packed(20, [kernel, kernel])
                conv.packed(30, [1, 1])
                conv.packed(40, [1, 1])
                conv.message(50) { valid in
                    valid.message(1) { amounts in
                        amounts.message(10) {
                            $0.uint(1, padTop)
                            $0.uint(2, padBottom)
                        }
                        amounts.message(10) {
                            $0.uint(1, padLeft)
                            $0.uint(2, padRight)
                        }
                    }
                }
                conv.uint(70, 1)
                conv.message(90) { $0.data(2, weights) }
                conv.message(91) { $0.data(2, bias) }
            }
        }

        switch activationType {
        case 0:
            break
        case 1:
            activation(layer.name + "_relu", input: convolutionOutput, output: output, slope: 0)
        case 2:
            activation(layer.name + "_lrelu", input: convolutionOutput, output: output, slope: layer.arrays[10]?.first ?? 0.01)
        default:
            throw UnsupportedError("convolution \(layer.name): activation \(activationType)")
        }
        return outputChannels
    }

    /// Plain ReLU when the slope is 0, leaky ReLU otherwise.
    private func activation(_ name: String, input: String, output: String, slope: Double) {
        emit(name, inputs: [input], output: output) { message in
            message.message(130) { activation in
                if slope == 0 {
                    activation.message(10) { _ in }
                } else {
                    activation.message(15) { $0.float(1, Float(slope)) }
                }
            }
        }
    }

    /// One slope per channel, or a single one for all of them. The slopes are raw fp32, like biases.
    private func prelu(_ layer: NCNNLayer, input: String, output: String, channels: Int) throws {
        let slopeCount = layer.int(0, 0)
        guard slopeCount == 1 || slopeCount == channels else {
            throw UnsupportedError("prelu \(layer.name): slope count")
        }
        let stored = try weightReader.rawValues(slopeCount)
        var slopes = stored
        if slopeCount == 1 && channels > 1 {
            slopes = Data()
            for _ in 0..<channels {
                slopes.append(stored)
            }
        }
        emit(layer.name, inputs: [input], output: output) { message in
            message.message(130) { activation in
                activation.message(25) { $0.message(1) { $0.data(2, slopes) } }
            }
        }
    }

    /// Returns the block size.
    private func pixelShuffle(_ layer: NCNNLayer, input: String, output: String, channels: Int) throws -> Int {
        let block = layer.int(0, 1)
        guard block >= 1, channels % (block * block) == 0 else {
            throw UnsupportedError("pixel shuffle \(layer.name): block size")
        }
        // ncnn mode 0 is pixel_shuffle from PyTorch, mode 1 is depth_to_space from TensorFlow
        let mode = layer.int(1, 0)
        guard mode == 0 || mode == 1 else {
            throw UnsupportedError("pixel shuffle \(layer.name): mode \(mode)")
        }
        emit(layer.name, inputs: [input], output: output) { message in
            message.message(345) { reorganize in
                reorganize.uint(1, mode == 0 ? 2 : 1)  // PIXEL_SHUFFLE or DEPTH_TO_SPACE
                reorganize.uint(2, block)
            }
        }
        return block
    }

    /// Returns the channel count of the result.
    private func concat(_ layer: NCNNLayer, inputs: [String], output: String) throws -> Int {
        guard layer.int(0, 0) == 0 else {
            throw UnsupportedError("concat \(layer.name): axis")
        }
        var total = 0
        for input in inputs {
            guard let shape = shapes[input] else {
                throw UnsupportedError("concat \(layer.name): unknown input")
            }
            total += shape.channels
        }
        emit(layer.name, inputs: inputs, output: output) { $0.message(980) { $0.uint(1, 1) } }
        return total
    }

    /// Only sums, with optional coefficients. Added two at a time.
    private func eltwise(_ layer: NCNNLayer, inputs: [String], output: String) throws {
        guard layer.int(0, 0) == 1, inputs.count >= 2 else {
            throw UnsupportedError("eltwise \(layer.name): only sums")
        }
        let coefficients = layer.arrays[1] ?? Array(repeating: 1, count: inputs.count)
        guard coefficients.count == inputs.count else {
            throw UnsupportedError("eltwise \(layer.name): coefficients")
        }

        var terms: [String] = []
        for (index, (blob, coefficient)) in zip(inputs, coefficients).enumerated() {
            if coefficient == 1 {
                terms.append(blob)
            } else {
                let scaled = "\(layer.name)_scale\(index)"
                linear("\(layer.name)_lin\(index)", input: blob, output: scaled, alpha: coefficient, beta: 0)
                terms.append(scaled)
            }
        }

        var sum = terms[0]
        for (index, term) in terms.dropFirst().enumerated() {
            let isLast = index == terms.count - 2
            let target = isLast ? output : "\(layer.name)_sum\(index)"
            emit(isLast ? layer.name : "\(layer.name)_add\(index)", inputs: [sum, term], output: target) {
                $0.message(230) { _ in }
            }
            sum = target
        }
    }

    private func binaryOp(_ layer: NCNNLayer, inputs: [String], output: String) throws {
        let operation = layer.int(0, 0)
        if layer.int(1, 0) == 1 {
            // second operand is a constant
            let constant = layer.double(2, 0)
            switch operation {
            case 0: linear(layer.name, input: inputs[0], output: output, alpha: 1, beta: constant)
            case 2: linear(layer.name, input: inputs[0], output: output, alpha: constant, beta: 0)
            default: throw UnsupportedError("binary op \(layer.name): \(operation) with a scalar")
            }
        } else {
            guard operation == 0, inputs.count == 2 else {
                throw UnsupportedError("binary op \(layer.name): only add")
            }
            emit(layer.name, inputs: inputs, output: output) { $0.message(230) { _ in } }
        }
    }

    /// Returns the factor the picture grows by.
    private func interp(_ layer: NCNNLayer, input: String, output: String) throws -> Int {
        let heightFactor = layer.double(1, 1)
        let widthFactor = layer.double(2, 1)
        guard layer.int(0, 1) == 1, heightFactor == widthFactor, heightFactor >= 1,
            heightFactor == heightFactor.rounded(), layer.int(3, 0) == 0, layer.int(4, 0) == 0
        else {
            throw UnsupportedError("interp \(layer.name): only nearest by an integer factor")
        }
        let factor = Int(heightFactor)
        emit(layer.name, inputs: [input], output: output) { $0.message(210) { $0.packed(1, [factor, factor]) } }
        return factor
    }

    /// output = input * alpha + beta
    private func linear(_ name: String, input: String, output: String, alpha: Double, beta: Double) {
        emit(name, inputs: [input], output: output) { message in
            message.message(130) { activation in
                activation.message(5) {
                    if alpha != 0 { $0.float(1, Float(alpha)) }
                    if beta != 0 { $0.float(2, Float(beta)) }
                }
            }
        }
    }

    private func emit(_ name: String, inputs: [String], output: String, _ body: (inout ProtobufWriter) -> Void) {
        var message = ProtobufWriter()
        message.string(1, name)
        for input in inputs {
            message.string(2, input)
        }
        message.string(3, output)
        body(&message)
        encodedLayers.append(message.bytes)
    }

    // MARK: The model file

    private func specification(inputName: String, outputName: String, scale: Int) -> [UInt8] {
        var spec = ProtobufWriter()
        spec.uint(1, 6)  // specificationVersion
        spec.message(2) { description in
            func feature(_ field: Int, _ name: String, _ size: Int) {
                description.message(field) { feature in
                    feature.string(1, name)
                    feature.message(3) { type in
                        type.message(5) { array in
                            array.packed(1, [1, 3, size, size])
                            array.uint(2, 65568)  // FLOAT32
                        }
                    }
                }
            }
            feature(1, inputName, tileSize)
            feature(10, outputName, tileSize * scale)
        }
        spec.message(500) { network in
            for layer in encodedLayers {
                network.message(1) { $0.append(layer) }
            }
            network.uint(5, 1)  // arrayInputShapeMapping = EXACT_ARRAY_MAPPING
        }
        return spec.bytes
    }
}
