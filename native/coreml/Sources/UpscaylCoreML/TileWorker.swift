import CoreML
import Foundation

/// Runs tiles through one loaded model. Every thread gets its own worker, because the input array and the
/// buffers are reused from tile to tile.
final class TileWorker {
    private static let byteToUnit: Float = 1.0 / 255.0

    private let model: MLModel
    private let outputName: String
    private let geometry: TileGeometry
    private let tta: Bool

    private let input: MLMultiArray
    private let provider: MLDictionaryFeatureProvider
    private let inputPointer: UnsafeMutablePointer<Float>
    private let inputStrides: [Int]

    // only filled when tta is on: the tile as it was cut, one model result, and the running sum
    private var original: [Float]
    private var result: [Float]
    private var sum: [Float]

    init(model: MLModel, inputName: String, outputName: String, geometry: TileGeometry, tta: Bool) throws {
        self.model = model
        self.outputName = outputName
        self.geometry = geometry
        self.tta = tta

        let size = geometry.tileSize
        input = try MLMultiArray(shape: [1, 3, NSNumber(value: size), NSNumber(value: size)], dataType: .float32)
        provider = try MLDictionaryFeatureProvider(dictionary: [inputName: MLFeatureValue(multiArray: input)])
        inputPointer = input.dataPointer.bindMemory(to: Float.self, capacity: 3 * size * size)
        inputStrides = input.strides.map { $0.intValue }

        let upscaled = geometry.upscaledTileSize
        original = [Float](repeating: 0, count: tta ? 3 * size * size : 0)
        result = [Float](repeating: 0, count: tta ? 3 * upscaled * upscaled : 0)
        sum = [Float](repeating: 0, count: tta ? 3 * upscaled * upscaled : 0)
    }

    /// Upscales one tile of `source` and writes the useful part of it into `destination`.
    func process(tile: Int, from source: UnsafePointer<UInt8>, into destination: UnsafeMutablePointer<UInt8>) throws {
        let row = tile / geometry.columns
        let column = tile % geometry.columns

        if tta {
            let size = geometry.tileSize
            readPixels(column: column, row: row, from: source) { x, y, red, green, blue in
                let offset = y * size + x
                original[offset] = red
                original[size * size + offset] = green
                original[2 * size * size + offset] = blue
            }
            try predictAugmented()
            let upscaled = geometry.upscaledTileSize
            sum.withUnsafeBufferPointer { buffer in
                copy(buffer.baseAddress!, strides: [0, upscaled * upscaled, upscaled, 1],
                     column: column, row: row, into: destination)
            }
            return
        }

        let strides = inputStrides
        let pointer = inputPointer
        readPixels(column: column, row: row, from: source) { x, y, red, green, blue in
            let offset = y * strides[2] + x * strides[3]
            pointer[offset] = red
            pointer[strides[1] + offset] = green
            pointer[2 * strides[1] + offset] = blue
        }
        let prediction = try model.prediction(from: provider)
        guard let array = prediction.featureValue(for: outputName)?.multiArrayValue else {
            throw UnsupportedError("the model gave no output")
        }
        store(array, column: column, row: row, into: destination)
    }

    // MARK: Input

    /// Cuts a tile out of the image. Where it sticks out over the edge the border pixels are repeated.
    private func readPixels(column: Int, row: Int, from source: UnsafePointer<UInt8>,
                            _ put: (_ x: Int, _ y: Int, _ red: Float, _ green: Float, _ blue: Float) -> Void) {
        let size = geometry.tileSize
        for y in 0..<size {
            let sourceY = min(max(row * geometry.step + y - geometry.padding, 0), geometry.imageHeight - 1)
            for x in 0..<size {
                let sourceX = min(max(column * geometry.step + x - geometry.padding, 0), geometry.imageWidth - 1)
                let offset = (sourceY * geometry.imageWidth + sourceX) * 3
                put(x, y,
                    Float(source[offset]) * TileWorker.byteToUnit,
                    Float(source[offset + 1]) * TileWorker.byteToUnit,
                    Float(source[offset + 2]) * TileWorker.byteToUnit)
            }
        }
    }

    // MARK: Output

    private func store(_ array: MLMultiArray, column: Int, row: Int, into destination: UnsafeMutablePointer<UInt8>) {
        let strides = array.strides.map { $0.intValue }
        switch array.dataType {
        case .float16:
            copy(array.dataPointer.assumingMemoryBound(to: Float16.self), strides: strides,
                 column: column, row: row, into: destination)
        case .double:
            copy(array.dataPointer.assumingMemoryBound(to: Double.self), strides: strides,
                 column: column, row: row, into: destination)
        default:
            copy(array.dataPointer.assumingMemoryBound(to: Float.self), strides: strides,
                 column: column, row: row, into: destination)
        }
    }

    /// Copies the middle of an upscaled tile (without the overlap) into the output picture as 8 bit RGB.
    private func copy<Value: BinaryFloatingPoint>(
        _ base: UnsafePointer<Value>, strides: [Int], column: Int, row: Int,
        into destination: UnsafeMutablePointer<UInt8>
    ) {
        let scale = geometry.scale
        let blockSize = geometry.step * scale
        let startX = column * blockSize
        let startY = row * blockSize
        let width = min(blockSize, geometry.outputWidth - startX)
        let height = min(blockSize, geometry.outputHeight - startY)
        guard width > 0, height > 0 else { return }

        let skip = geometry.padding * scale
        for y in 0..<height {
            let rowStart = (skip + y) * strides[2] + skip * strides[3]
            var out = ((startY + y) * geometry.outputWidth + startX) * 3
            for x in 0..<width {
                let index = rowStart + x * strides[3]
                for channel in 0..<3 {
                    let value = Float(base[channel * strides[1] + index]) * 255 + 0.5
                    destination[out + channel] = value.isNaN ? 0 : UInt8(max(0, min(255, value)))
                }
                out += 3
            }
        }
    }

    // MARK: Test time augmentation

    /// Runs the model on the tile in all eight orientations, turns every result back and averages them into `sum`.
    private func predictAugmented() throws {
        let size = geometry.tileSize
        let upscaled = geometry.upscaledTileSize
        for index in 0..<sum.count {
            sum[index] = 0
        }

        for orientation in Orientation.all {
            for y in 0..<size {
                for x in 0..<size {
                    let from = orientation.source(x: x, y: y, size: size)
                    let sourceOffset = from.y * size + from.x
                    let offset = y * inputStrides[2] + x * inputStrides[3]
                    inputPointer[offset] = original[sourceOffset]
                    inputPointer[inputStrides[1] + offset] = original[size * size + sourceOffset]
                    inputPointer[2 * inputStrides[1] + offset] = original[2 * size * size + sourceOffset]
                }
            }

            let prediction = try model.prediction(from: provider)
            guard let array = prediction.featureValue(for: outputName)?.multiArrayValue else {
                throw UnsupportedError("the model gave no output")
            }
            readDense(array)

            let plane = upscaled * upscaled
            for y in 0..<upscaled {
                for x in 0..<upscaled {
                    let back = orientation.target(x: x, y: y, size: upscaled)
                    let sourceOffset = back.y * upscaled + back.x
                    let offset = y * upscaled + x
                    sum[offset] += result[sourceOffset]
                    sum[plane + offset] += result[plane + sourceOffset]
                    sum[2 * plane + offset] += result[2 * plane + sourceOffset]
                }
            }
        }

        let eighth: Float = 1.0 / 8.0
        for index in 0..<sum.count {
            sum[index] *= eighth
        }
    }

    /// Puts a model result into `result` as a plain 3 x size x size array of Float.
    private func readDense(_ array: MLMultiArray) {
        let strides = array.strides.map { $0.intValue }
        let size = geometry.upscaledTileSize

        func fill<Value: BinaryFloatingPoint>(_ base: UnsafePointer<Value>) {
            for channel in 0..<3 {
                for y in 0..<size {
                    let rowStart = channel * strides[1] + y * strides[2]
                    let target = (channel * size + y) * size
                    for x in 0..<size {
                        result[target + x] = Float(base[rowStart + x * strides[3]])
                    }
                }
            }
        }

        switch array.dataType {
        case .float16: fill(array.dataPointer.assumingMemoryBound(to: Float16.self))
        case .double: fill(array.dataPointer.assumingMemoryBound(to: Double.self))
        default: fill(array.dataPointer.assumingMemoryBound(to: Float.self))
        }
    }
}
