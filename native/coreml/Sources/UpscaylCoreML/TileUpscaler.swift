import CoreML
import Foundation

/// Upscales an image tile by tile. In the default mode the GPU and the Neural Engine each get a model and a
/// thread, and both take tiles from the same queue, so the faster one simply does more of them.
final class TileUpscaler {
    let scale: Int
    private let models: [MLModel]
    private let inputName: String
    private let outputName: String

    init(compiledModel url: URL, mode: ComputeMode) throws {
        func load(_ units: MLComputeUnits) throws -> MLModel {
            let configuration = MLModelConfiguration()
            configuration.computeUnits = units
            configuration.allowLowPrecisionAccumulationOnGPU = true
            return try MLModel(contentsOf: url, configuration: configuration)
        }

        var loaded: [MLModel] = []
        if mode != .ane {
            loaded.append(try load(.cpuAndGPU))
        }
        if mode != .gpu {
            // asking for the Neural Engine alone needs macOS 13, older systems just use the GPU
            if #available(macOS 13.0, *), let engineModel = try? load(.cpuAndNeuralEngine) {
                loaded.append(engineModel)
            } else if loaded.isEmpty {
                loaded.append(try load(.cpuAndGPU))
            }
        }
        models = loaded

        let description = loaded[0].modelDescription
        guard let input = description.inputDescriptionsByName.keys.first,
            let output = description.outputDescriptionsByName.first,
            let shape = output.value.multiArrayConstraint?.shape, shape.count == 4,
            shape[3].intValue % TileGeometry.defaultTileSize == 0
        else {
            throw UnsupportedError("the converted model has an unexpected shape")
        }
        inputName = input
        outputName = output.key
        scale = shape[3].intValue / TileGeometry.defaultTileSize
    }

    var workerCount: Int {
        models.count
    }

    /// Returns the picture `scale` times larger as 8 bit RGB.
    /// With `tta` every tile goes through the model eight times (flipped and turned) and the results are averaged.
    /// `progress` gets values from 0 to 1 and is called from the worker threads.
    func upscale(_ raster: Raster, tta: Bool, progress: @escaping (Double) -> Void) throws -> [UInt8] {
        let geometry = TileGeometry(imageWidth: raster.width, imageHeight: raster.height, scale: scale)
        var output = [UInt8](repeating: 0, count: geometry.outputWidth * geometry.outputHeight * 3)
        let queue = TileQueue(total: geometry.tileCount)
        let group = DispatchGroup()

        raster.rgb.withUnsafeBufferPointer { source in
            output.withUnsafeMutableBufferPointer { destination in
                guard let sourcePointer = source.baseAddress, let destinationPointer = destination.baseAddress else { return }
                for (index, model) in models.enumerated() {
                    group.enter()
                    // the first model is the one that must not fail, the others only help
                    let isHelper = index > 0
                    Thread.detachNewThread { [self] in
                        defer { group.leave() }
                        work(model: model, isHelper: isHelper, queue: queue, geometry: geometry, tta: tta,
                             source: sourcePointer, destination: destinationPointer, progress: progress)
                    }
                }
                group.wait()
            }
        }

        if let failure = queue.failure {
            throw failure
        }
        guard queue.finished == geometry.tileCount else {
            throw UnsupportedError("not every tile was processed")
        }
        return output
    }

    private func work(
        model: MLModel, isHelper: Bool, queue: TileQueue, geometry: TileGeometry, tta: Bool,
        source: UnsafePointer<UInt8>, destination: UnsafeMutablePointer<UInt8>, progress: (Double) -> Void
    ) {
        let worker: TileWorker
        do {
            worker = try TileWorker(model: model, inputName: inputName, outputName: outputName,
                                    geometry: geometry, tta: tta)
        } catch {
            if !isHelper { queue.fail(error) }
            return
        }

        // the main worker waits while a helper still holds a tile, in case it has to give it back
        while let tile = queue.take(canWait: !isHelper) {
            do {
                try worker.process(tile: tile, from: source, into: destination)
            } catch {
                // The Neural Engine can turn a model down while running. Its tile goes back for the GPU to do.
                if isHelper {
                    queue.giveBack(tile)
                } else {
                    queue.fail(error)
                }
                return
            }
            progress(Double(queue.markDone()) / Double(geometry.tileCount))
        }
    }
}
