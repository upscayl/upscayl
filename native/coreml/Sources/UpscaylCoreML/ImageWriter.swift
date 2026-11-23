import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

enum OutputFormat {
    case png
    case jpeg(quality: Double)
}

struct EncodeError: Error, CustomStringConvertible {
    let description: String
}

enum ImageWriter {
    /// Saves an upscaled picture.
    /// - `pixels` is RGB at `width` x `height`; `source` is the picture it came from (alpha and color profile).
    /// - `finalSize` is the size to save at, when it isn't the size of `pixels`.
    static func write(
        pixels: [UInt8], width: Int, height: Int, source: Raster,
        finalSize: (width: Int, height: Int), format: OutputFormat, toPath path: String
    ) throws {
        let image = try makeImage(
            pixels: pixels, width: width, height: height, source: source, finalSize: finalSize, format: format)

        let type: UTType
        var options: [CFString: Any] = [:]
        switch format {
        case .png:
            type = .png
        case .jpeg(let quality):
            type = .jpeg
            options[kCGImageDestinationLossyCompressionQuality] = quality
        }

        // The picture is written next to the target and moved into place, so a half written file never replaces
        // a good one. The encoder sometimes gives up on a huge picture, so it gets a second try.
        let target = URL(fileURLWithPath: path)
        let temporary = target.deletingLastPathComponent()
            .appendingPathComponent(".\(UUID().uuidString.prefix(8)).upscayl-tmp")
        var problem = "cannot create \(path)"
        TemporaryFile.current.set(temporary)
        defer { TemporaryFile.current.set(nil) }

        for _ in 0..<2 {
            guard let destination = CGImageDestinationCreateWithURL(temporary as CFURL, type.identifier as CFString, 1, nil)
            else { continue }
            CGImageDestinationAddImage(destination, image, options as CFDictionary)
            if CGImageDestinationFinalize(destination) {
                if FileManager.default.fileExists(atPath: path) {
                    try? FileManager.default.removeItem(at: target)
                }
                do {
                    try FileManager.default.moveItem(at: temporary, to: target)
                    return
                } catch {
                    problem = "cannot move the result to \(path): \(error.localizedDescription)"
                    break
                }
            }
            problem = "the encoder refused a \(image.width)x\(image.height) picture"
            try? FileManager.default.removeItem(at: temporary)
        }
        try? FileManager.default.removeItem(at: temporary)
        throw EncodeError(description: problem)
    }

    // MARK: Building the picture

    private static func makeImage(
        pixels: [UInt8], width: Int, height: Int, source: Raster,
        finalSize: (width: Int, height: Int), format: OutputFormat
    ) throws -> CGImage {
        let colorSpace = source.colorSpace
        guard let full = rgbImage(pixels, width: width, height: height, colorSpace: colorSpace) else {
            throw EncodeError(description: "cannot build the picture")
        }
        let needsResize = finalSize.width != width || finalSize.height != height
        guard needsResize || source.alpha != nil else { return full }

        guard var resized = resample(full, width: finalSize.width, height: finalSize.height, colorSpace: colorSpace) else {
            throw EncodeError(description: "cannot resize the picture")
        }
        let pixelCount = finalSize.width * finalSize.height

        if let alpha = source.alpha {
            // the model doesn't know about transparency, the alpha plane is only stretched to the new size
            guard let alphaImage = grayImage(alpha, width: source.width, height: source.height),
                let plane = resample(alphaImage, width: finalSize.width, height: finalSize.height,
                                     colorSpace: CGColorSpaceCreateDeviceGray(), gray: true)
            else { throw EncodeError(description: "cannot resize the alpha channel") }

            // JPEG has no alpha, so only PNG gets it back
            if case .png = format {
                for pixel in 0..<pixelCount {
                    resized[pixel * 4 + 3] = plane[pixel]
                }
                guard let image = rgbaImage(resized, width: finalSize.width, height: finalSize.height, colorSpace: colorSpace)
                else { throw EncodeError(description: "cannot build the picture with alpha") }
                return image
            }
        }

        var packed = [UInt8](repeating: 0, count: pixelCount * 3)
        for pixel in 0..<pixelCount {
            for channel in 0..<3 {
                packed[pixel * 3 + channel] = resized[pixel * 4 + channel]
            }
        }
        guard let image = rgbImage(packed, width: finalSize.width, height: finalSize.height, colorSpace: colorSpace) else {
            throw EncodeError(description: "cannot build the picture")
        }
        return image
    }

    private static func rgbImage(_ bytes: [UInt8], width: Int, height: Int, colorSpace: CGColorSpace) -> CGImage? {
        guard let provider = CGDataProvider(data: Data(bytes) as CFData) else { return nil }
        return CGImage(
            width: width, height: height, bitsPerComponent: 8, bitsPerPixel: 24, bytesPerRow: width * 3,
            space: colorSpace, bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.none.rawValue),
            provider: provider, decode: nil, shouldInterpolate: false, intent: .defaultIntent)
    }

    private static func rgbaImage(_ bytes: [UInt8], width: Int, height: Int, colorSpace: CGColorSpace) -> CGImage? {
        guard let provider = CGDataProvider(data: Data(bytes) as CFData) else { return nil }
        return CGImage(
            width: width, height: height, bitsPerComponent: 8, bitsPerPixel: 32, bytesPerRow: width * 4,
            space: colorSpace, bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.last.rawValue),
            provider: provider, decode: nil, shouldInterpolate: false, intent: .defaultIntent)
    }

    private static func grayImage(_ plane: [UInt8], width: Int, height: Int) -> CGImage? {
        guard let provider = CGDataProvider(data: Data(plane) as CFData) else { return nil }
        return CGImage(
            width: width, height: height, bitsPerComponent: 8, bitsPerPixel: 8, bytesPerRow: width,
            space: CGColorSpaceCreateDeviceGray(), bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.none.rawValue),
            provider: provider, decode: nil, shouldInterpolate: false, intent: .defaultIntent)
    }

    /// Draws `source` at a new size with the best interpolation CoreGraphics has. The result is 4 bytes per pixel
    /// (RGB and a skipped byte), or 1 byte per pixel for a gray plane.
    private static func resample(
        _ source: CGImage, width: Int, height: Int, colorSpace: CGColorSpace, gray: Bool = false
    ) -> [UInt8]? {
        let bytesPerPixel = gray ? 1 : 4
        var bytes = [UInt8](repeating: 0, count: width * height * bytesPerPixel)
        let drawn = bytes.withUnsafeMutableBytes { raw -> Bool in
            guard let context = CGContext(
                data: raw.baseAddress, width: width, height: height, bitsPerComponent: 8,
                bytesPerRow: width * bytesPerPixel, space: colorSpace,
                bitmapInfo: gray ? CGImageAlphaInfo.none.rawValue : CGImageAlphaInfo.noneSkipLast.rawValue)
            else { return false }
            context.interpolationQuality = .high
            context.draw(source, in: CGRect(x: 0, y: 0, width: width, height: height))
            return true
        }
        return drawn ? bytes : nil
    }
}
