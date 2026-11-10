import Foundation

/// upscayl-coreml: the Apple Silicon engine. It takes the command line of upscayl-bin and runs the same ncnn
/// models through Core ML.
///
///     upscayl-coreml -i <image|folder> -o <image|folder> -m <models folder> -n <model>
///                    [-s scale] [-w width] [-f png|jpg] [-c compression] [-x]
///                    [--cache <folder>] [--units hybrid|gpu|ane]
///
/// Exit status 3 means the request is not for this engine (unknown layer, unsupported option, no Core ML).
/// Nothing has been written in that case, and the app runs upscayl-bin instead. A line starting with
/// `coreml-fallback:` on stderr says why.
public final class CommandLineTool {
    private static let imageExtensions: Set<String> = ["png", "jpg", "jpeg", "jfif", "webp"]
    /// What a big picture really needs per output pixel, counting the copies made while saving.
    private static let bytesPerOutputPixel = 12.0

    private struct Job {
        let input: String
        let output: String
    }

    private let console = Console.shared
    private var options = Options(arguments: [])
    private var upscaler: TileUpscaler?
    private var written = 0

    public init() {}

    public func run(arguments: [String]) -> Int32 {
        StopSignals.install()
        options = Options(arguments: arguments)
        do {
            return try upscaleEverything()
        } catch {
            console.say("coreml-fallback: \(error)")
            return ExitStatus.useNcnn
        }
    }

    // MARK: Steps

    /// Everything up to the first saved picture. An error thrown here means "use ncnn".
    private func upscaleEverything() throws -> Int32 {
        guard ["png", "jpg", "jpeg"].contains(options.format) else {
            throw UnsupportedError("output format \(options.format) is not supported")
        }
        guard !options.input.isEmpty, !options.output.isEmpty, !options.modelsFolder.isEmpty, !options.modelName.isEmpty else {
            throw UnsupportedError("missing arguments")
        }

        let basePath = (options.modelsFolder as NSString).appendingPathComponent(options.modelName)
        let model = try NCNNModel(paramPath: basePath + ".param", binPath: basePath + ".bin")

        var isFolder: ObjCBool = false
        guard FileManager.default.fileExists(atPath: options.input, isDirectory: &isFolder) else {
            // the same line upscayl-bin prints, the app reports it
            console.say("Error: Couldn't read the image '\(options.input)'!")
            return ExitStatus.success
        }
        var jobs = collectJobs(isFolder: isFolder.boolValue)

        let cacheFolder = URL(fileURLWithPath: options.cacheFolder
            ?? (NSHomeDirectory() as NSString).appendingPathComponent("Library/Caches/Upscayl/coreml"))
        let cache = ModelCache(folder: cacheFolder, tileSize: TileGeometry.defaultTileSize)
        let compiled = try cache.compiledModel(for: model, name: options.modelName) { console.say($0) }
        let upscaler = try TileUpscaler(compiledModel: compiled, mode: options.mode)
        self.upscaler = upscaler

        // All inputs are looked at before anything is saved: falling back after the first file would make
        // ncnn start the whole folder again.
        jobs = try jobsThatFit(jobs, scale: upscaler.scale)

        let workers = upscaler.workerCount == 2 ? "GPU and Neural Engine" : "one compute unit"
        console.say("Using the Core ML engine (\(workers)), model x\(upscaler.scale)\(options.tta ? ", TTA mode" : "")")

        for job in jobs {
            do {
                try process(job, with: upscaler)
            } catch {
                return try giveUp(error)
            }
        }
        return ExitStatus.success
    }

    private func collectJobs(isFolder: Bool) -> [Job] {
        guard isFolder else {
            return [Job(input: options.input, output: options.output)]
        }
        let names = ((try? FileManager.default.contentsOfDirectory(atPath: options.input)) ?? []).sorted()
        return names
            .filter { CommandLineTool.imageExtensions.contains(($0 as NSString).pathExtension.lowercased()) }
            .map { name in
                let stem = (name as NSString).deletingPathExtension
                return Job(
                    input: (options.input as NSString).appendingPathComponent(name),
                    output: (options.output as NSString).appendingPathComponent("\(stem).\(options.format)"))
            }
    }

    /// Drops the pictures whose result would not fit in memory, and tells the app about them.
    private func jobsThatFit(_ jobs: [Job], scale: Int) throws -> [Job] {
        let memoryBudget = Double(ProcessInfo.processInfo.physicalMemory) / 2
        var fitting: [Job] = []
        for job in jobs {
            guard let size = ImageReader.size(atPath: job.input) else {
                // no decoder for it here, ncnn may have one (WebP on an old macOS)
                if isWebP(job.input) {
                    throw UnsupportedError("cannot decode \(job.input)")
                }
                fitting.append(job)
                continue
            }
            let needed = Double(size.width * scale) * Double(size.height * scale) * CommandLineTool.bytesPerOutputPixel
            if needed > memoryBudget {
                console.say("Error: '\(job.input)' is too big for this Mac, the result needs about \(Int(needed / 1_000_000_000)) GB")
                continue
            }
            fitting.append(job)
        }
        return fitting
    }

    private func process(_ job: Job, with upscaler: TileUpscaler) throws {
        guard let raster = ImageReader.read(atPath: job.input) else {
            // ImageIO can't read it, ncnn might
            if isWebP(job.input) {
                throw UnsupportedError("cannot decode \(job.input)")
            }
            console.say("Error: Couldn't read the image '\(job.input)'!")
            return
        }

        // Every picture starts with 0.00%, like in upscayl-bin. The app counts these lines for a double upscale.
        console.say("0.00%")
        let progress = ProgressPrinter()
        let pixels = try upscaler.upscale(raster, tta: options.tta) { progress.report($0) }

        let format = outputFormat()
        let size = finalSize(for: raster, upscalerScale: upscaler.scale)
        do {
            try ImageWriter.write(
                pixels: pixels, width: raster.width * upscaler.scale, height: raster.height * upscaler.scale,
                source: raster, finalSize: size, format: format, toPath: job.output)
        } catch {
            // Saving is the last step. A file that can't be written is not a reason to start over.
            console.say("Error: could not save '\(job.output)': \(error)")
            return
        }
        written += 1
        console.say("100.00")
        console.say("")
        console.say("Upscayled Successfully!")
    }

    /// Falling back is fine as long as nothing is saved. Afterwards ncnn would redo the whole folder.
    private func giveUp(_ error: Error) throws -> Int32 {
        if written == 0 {
            throw error
        }
        console.say("Error: Core ML stopped: \(error)")
        return ExitStatus.failure
    }

    // MARK: Output size

    private func outputFormat() -> OutputFormat {
        guard options.format != "png" else { return .png }
        let quality = max(0, min(100, 100 - options.compression))
        return .jpeg(quality: Double(quality) / 100)
    }

    /// The size to save at: the model's own result, or whatever -w / -s ask for.
    private func finalSize(for raster: Raster, upscalerScale: Int) -> (width: Int, height: Int) {
        if let width = options.width, width > 0 {
            let height = max(1, raster.height * width / raster.width)
            console.say("Calculated height from width: \(height)")
            console.say("Resizing image according to desired resolution")
            console.say("Resized image from \(raster.width)x\(raster.height) to \(width)x\(height)")
            return (width, height)
        }
        if let scale = options.scale, scale.isFinite, scale > 0,
            Int(scale) != upscalerScale || scale != Double(Int(scale))
        {
            let width = max(1, Int((Double(raster.width) * scale).rounded()))
            let height = max(1, Int((Double(raster.height) * scale).rounded()))
            console.say("Resizing image according to output scale")
            console.say("Scaled image from \(raster.width)x\(raster.height) to \(width)x\(height)")
            return (width, height)
        }
        return (raster.width * upscalerScale, raster.height * upscalerScale)
    }

    private func isWebP(_ path: String) -> Bool {
        (path as NSString).pathExtension.lowercased() == "webp"
    }
}

/// Prints progress lines like upscayl-bin does, but not more often than every half percent.
/// The worker threads call it, so it has a lock.
private final class ProgressPrinter {
    private let lock = NSLock()
    private var lastPrinted = 0.0

    func report(_ fraction: Double) {
        // 100 is printed once the picture is saved, never from here
        let percent = min(fraction * 100, 99.99)
        lock.lock()
        defer { lock.unlock() }
        guard percent - lastPrinted >= 0.5 else { return }
        lastPrinted = percent
        Console.shared.say(String(format: "%.2f%%", percent))
    }
}
