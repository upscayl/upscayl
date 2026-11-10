import XCTest

@testable import UpscaylCoreML

final class OptionsTests: XCTestCase {
    func testReadsTheFlagsOfUpscaylBin() {
        let options = Options(arguments: [
            "-i", "in.png", "-o", "out.png", "-m", "/models", "-n", "upscayl-standard-4x",
            "-s", "2", "-w", "1920", "-f", "JPG", "-c", "25", "-x",
        ])
        XCTAssertEqual(options.input, "in.png")
        XCTAssertEqual(options.output, "out.png")
        XCTAssertEqual(options.modelsFolder, "/models")
        XCTAssertEqual(options.modelName, "upscayl-standard-4x")
        XCTAssertEqual(options.scale, 2)
        XCTAssertEqual(options.width, 1920)
        XCTAssertEqual(options.format, "jpg")
        XCTAssertEqual(options.compression, 25)
        XCTAssertTrue(options.tta)
    }

    func testSkipsFlagsItDoesNotUse() {
        let options = Options(arguments: ["-t", "200", "-g", "0", "-i", "a.png", "-j", "1:2:2", "-o", "b.png"])
        XCTAssertEqual(options.input, "a.png")
        XCTAssertEqual(options.output, "b.png")
    }

    func testAnUnknownFlagWithoutValueDoesNotEatTheNextFlag() {
        let options = Options(arguments: ["-v", "-i", "a.png"])
        XCTAssertEqual(options.input, "a.png")
    }

    func testDefaults() {
        let options = Options(arguments: [])
        XCTAssertEqual(options.format, "png")
        XCTAssertEqual(options.compression, 0)
        XCTAssertEqual(options.mode, .hybrid)
        XCTAssertFalse(options.tta)
        XCTAssertNil(options.cacheFolder)
    }

    func testComputeModeAndCacheFolder() {
        let options = Options(arguments: ["--units", "gpu", "--cache", "/tmp/cache"])
        XCTAssertEqual(options.mode, .gpu)
        XCTAssertEqual(options.cacheFolder, "/tmp/cache")
        XCTAssertEqual(Options(arguments: ["--units", "bogus"]).mode, .hybrid)
    }

    func testAFlagWithoutItsValueEndsParsing() {
        let options = Options(arguments: ["-i", "a.png", "-o"])
        XCTAssertEqual(options.input, "a.png")
        XCTAssertEqual(options.output, "")
    }
}
