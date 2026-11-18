import XCTest

@testable import UpscaylCoreML

final class ModelCacheTests: XCTestCase {
    func testRecognizesItsOwnEntries() {
        XCTAssertTrue(ModelCache.isEntry("realesrgan-x4plus-0123456789abcdef-t256-v2.mlmodelc", withPrefix: "realesrgan-x4plus-"))
        XCTAssertTrue(ModelCache.isEntry("realesrgan-x4plus-ffffffffffffffff-t512-v10.mlmodelc", withPrefix: "realesrgan-x4plus-"))
    }

    func testLeavesTheEntriesOfAModelWithALongerNameAlone() {
        let other = "realesrgan-x4plus-anime-0123456789abcdef-t256-v2.mlmodelc"
        XCTAssertFalse(ModelCache.isEntry(other, withPrefix: "realesrgan-x4plus-"))
        XCTAssertTrue(ModelCache.isEntry(other, withPrefix: "realesrgan-x4plus-anime-"))
    }

    func testLeavesOtherFilesAlone() {
        XCTAssertFalse(ModelCache.isEntry("model-0123456789abcdef-t256-v2.mlmodel", withPrefix: "model-"))
        XCTAssertFalse(ModelCache.isEntry("model-0123456789abcdef-t256-v2.mlmodelc.tmp", withPrefix: "model-"))
        XCTAssertFalse(ModelCache.isEntry("model-0123456789abcde-t256-v2.mlmodelc", withPrefix: "model-"))
        XCTAssertFalse(ModelCache.isEntry("other-0123456789abcdef-t256-v2.mlmodelc", withPrefix: "model-"))
    }
}
