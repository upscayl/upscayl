import CoreGraphics
import Foundation
import ImageIO

let sRGBColorSpace = CGColorSpace(name: CGColorSpace.sRGB)!

/// A decoded picture: 8 bit RGB, with the alpha channel (if any) kept apart and not premultiplied.
struct Raster {
    let width: Int
    let height: Int
    let rgb: [UInt8]
    let alpha: [UInt8]?
    let colorSpace: CGColorSpace
}

enum ImageReader {
    /// Width and height from the file header, without decoding the picture.
    static func size(atPath path: String) -> (width: Int, height: Int)? {
        guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
            CGImageSourceGetCount(source) > 0,
            let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
            let width = properties[kCGImagePropertyPixelWidth] as? Int,
            let height = properties[kCGImagePropertyPixelHeight] as? Int,
            width > 0, height > 0
        else { return nil }
        return (width, height)
    }

    /// nil when ImageIO can't read the file.
    static func read(atPath path: String) -> Raster? {
        guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
            CGImageSourceGetCount(source) > 0,
            let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
        else { return nil }
        let width = image.width
        let height = image.height
        guard width > 0, height > 0 else { return nil }

        // Keep the picture's own RGB profile so the numbers are not converted. ncnn doesn't convert them either.
        var colorSpace = image.colorSpace ?? sRGBColorSpace
        if colorSpace.model != .rgb {
            colorSpace = sRGBColorSpace
        }
        let hasAlpha = [.first, .last, .premultipliedFirst, .premultipliedLast].contains(image.alphaInfo)
        let alphaInfo: CGImageAlphaInfo = hasAlpha ? .premultipliedLast : .noneSkipLast

        var rgba = [UInt8](repeating: 0, count: width * height * 4)
        let drawn = rgba.withUnsafeMutableBytes { raw -> Bool in
            guard let context = CGContext(
                data: raw.baseAddress, width: width, height: height, bitsPerComponent: 8,
                bytesPerRow: width * 4, space: colorSpace, bitmapInfo: alphaInfo.rawValue)
            else { return false }
            context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
            return true
        }
        guard drawn else { return nil }

        var rgb = [UInt8](repeating: 0, count: width * height * 3)
        var alpha = hasAlpha ? [UInt8](repeating: 255, count: width * height) : nil
        rgba.withUnsafeBufferPointer { source in
            rgb.withUnsafeMutableBufferPointer { target in
                for pixel in 0..<(width * height) {
                    let alphaValue = Int(source[pixel * 4 + 3])
                    if hasAlpha && alphaValue != 255 {
                        alpha![pixel] = UInt8(alphaValue)
                        if alphaValue == 0 { continue }
                        // undo the premultiplication
                        for channel in 0..<3 {
                            let value = (Int(source[pixel * 4 + channel]) * 255 + alphaValue / 2) / alphaValue
                            target[pixel * 3 + channel] = UInt8(min(255, value))
                        }
                    } else {
                        for channel in 0..<3 {
                            target[pixel * 3 + channel] = source[pixel * 4 + channel]
                        }
                    }
                }
            }
        }
        return Raster(width: width, height: height, rgb: rgb, alpha: alpha, colorSpace: colorSpace)
    }
}
