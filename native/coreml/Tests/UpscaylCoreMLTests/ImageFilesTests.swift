import XCTest

@testable import UpscaylCoreML

final class ImageFilesTests: XCTestCase {
    private var folder: URL!

    override func setUpWithError() throws {
        folder = FileManager.default.temporaryDirectory.appendingPathComponent("upscayl-coreml-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
    }

    override func tearDownWithError() throws {
        try? FileManager.default.removeItem(at: folder)
    }

    private func raster(width: Int, height: Int, alpha: [UInt8]? = nil) -> Raster {
        var rgb: [UInt8] = []
        for pixel in 0..<(width * height) {
            rgb += [UInt8(pixel * 7 % 256), UInt8(pixel * 13 % 256), UInt8(pixel * 29 % 256)]
        }
        return Raster(width: width, height: height, rgb: rgb, alpha: alpha, colorSpace: sRGBColorSpace)
    }

    func testPngKeepsThePixels() throws {
        let source = raster(width: 6, height: 4)
        let path = folder.appendingPathComponent("plain.png").path
        try ImageWriter.write(
            pixels: source.rgb, width: 6, height: 4, source: source,
            finalSize: (6, 4), format: .png, toPath: path)

        let size = ImageReader.size(atPath: path)
        XCTAssertEqual(size?.width, 6)
        XCTAssertEqual(size?.height, 4)
        let read = try XCTUnwrap(ImageReader.read(atPath: path))
        XCTAssertEqual(read.rgb, source.rgb)
        XCTAssertNil(read.alpha)
    }

    func testPngKeepsTheAlphaChannel() throws {
        let alpha = [UInt8](repeating: 255, count: 12) + [UInt8](repeating: 0, count: 12)
        let source = raster(width: 6, height: 4, alpha: alpha)
        let path = folder.appendingPathComponent("alpha.png").path
        try ImageWriter.write(
            pixels: source.rgb, width: 6, height: 4, source: source,
            finalSize: (6, 4), format: .png, toPath: path)

        let read = try XCTUnwrap(ImageReader.read(atPath: path))
        let readAlpha = try XCTUnwrap(read.alpha)
        XCTAssertEqual(readAlpha.prefix(12), alpha.prefix(12))
        XCTAssertEqual(readAlpha.suffix(6), alpha.suffix(6))
    }

    func testSavesAtTheFinalSize() throws {
        let source = raster(width: 8, height: 8)
        let path = folder.appendingPathComponent("small.png").path
        try ImageWriter.write(
            pixels: source.rgb, width: 8, height: 8, source: source,
            finalSize: (4, 3), format: .png, toPath: path)

        let size = ImageReader.size(atPath: path)
        XCTAssertEqual(size?.width, 4)
        XCTAssertEqual(size?.height, 3)
    }

    func testJpegIsWritten() throws {
        let source = raster(width: 16, height: 16)
        let path = folder.appendingPathComponent("photo.jpg").path
        try ImageWriter.write(
            pixels: source.rgb, width: 16, height: 16, source: source,
            finalSize: (16, 16), format: .jpeg(quality: 0.9), toPath: path)
        XCTAssertNotNil(ImageReader.read(atPath: path))
    }

    func testReplacesAnExistingFileAndLeavesNoTemporaryOne() throws {
        let source = raster(width: 4, height: 4)
        let path = folder.appendingPathComponent("again.png").path
        for _ in 0..<2 {
            try ImageWriter.write(
                pixels: source.rgb, width: 4, height: 4, source: source,
                finalSize: (4, 4), format: .png, toPath: path)
        }
        let files = try FileManager.default.contentsOfDirectory(atPath: folder.path)
        XCTAssertEqual(files, ["again.png"])
    }

    func testUnreadableFilesGiveNil() throws {
        let path = folder.appendingPathComponent("notes.png")
        try Data("not a picture".utf8).write(to: path)
        XCTAssertNil(ImageReader.read(atPath: path.path))
        XCTAssertNil(ImageReader.size(atPath: path.path))
        XCTAssertNil(ImageReader.read(atPath: folder.appendingPathComponent("missing.png").path))
    }
}
