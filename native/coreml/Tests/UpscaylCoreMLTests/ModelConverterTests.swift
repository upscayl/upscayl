import XCTest

@testable import UpscaylCoreML

final class ModelConverterTests: XCTestCase {
    /// A graph with one convolution (3 -> 12 channels) and a pixel shuffle, so it enlarges by two.
    private func smallModel(
        convolutionParams: String = "0=12 1=3 4=1 5=1 6=324",
        extraLayers: String = "",
        extraWeights: Data = Data()
    ) throws -> NCNNModel {
        let text = """
            7767517
            3 3
            Input data 0 1 data
            Convolution conv 1 1 data features \(convolutionParams)
            PixelShuffle shuffle 1 1 features image 0=2
            \(extraLayers)
            """
        var weights = floatBytes(Array(repeating: 0.1, count: 324), tag: 0)
        weights.append(floatBytes(Array(repeating: 0, count: 12)))
        weights.append(extraWeights)
        return try NCNNModel(paramText: text, weights: weights)
    }

    func testConvertsASmallModel() throws {
        let converted = try ModelConverter(model: try smallModel(), tileSize: 64).convert()
        XCTAssertEqual(converted.scale, 2)
        XCTAssertEqual(converted.inputName, "data")
        XCTAssertEqual(converted.outputName, "image")
        XCTAssertGreaterThan(converted.bytes.count, 324 * 2)
    }

    func testRefusesALayerItDoesNotKnow() throws {
        let model = try smallModel(extraLayers: "Softmax soft 1 1 image probs")
        XCTAssertThrowsError(try ModelConverter(model: model, tileSize: 64).convert()) { error in
            XCTAssertTrue("\(error)".contains("Softmax"))
        }
    }

    func testRefusesAStridedConvolution() throws {
        let model = try smallModel(convolutionParams: "0=12 1=3 3=2 4=1 5=1 6=324")
        XCTAssertThrowsError(try ModelConverter(model: model, tileSize: 64).convert())
    }

    func testRefusesAWeightFileThatIsTooLong() throws {
        let model = try smallModel(extraWeights: Data(count: 8))
        XCTAssertThrowsError(try ModelConverter(model: model, tileSize: 64).convert())
    }

    func testRefusesAGraphThatDoesNotEndInAnImage() throws {
        let text = """
            7767517
            2 2
            Input data 0 1 data
            Convolution conv 1 1 data out 0=4 1=1 5=1 6=12
            """
        var weights = floatBytes(Array(repeating: 0.1, count: 12), tag: 0)
        weights.append(floatBytes(Array(repeating: 0, count: 4)))
        let model = try NCNNModel(paramText: text, weights: weights)
        XCTAssertThrowsError(try ModelConverter(model: model, tileSize: 64).convert())
    }

    /// Every model that ships with the app has to convert, and all of them enlarge four times.
    func testBundledModelsConvert() throws {
        let root = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let folder = root.appendingPathComponent("resources/models")
        guard let names = try? FileManager.default.contentsOfDirectory(atPath: folder.path) else {
            throw XCTSkip("no resources/models folder at \(folder.path)")
        }

        let models = names.filter { $0.hasSuffix(".param") }.sorted()
        try XCTSkipIf(models.isEmpty, "no models found")
        for file in models {
            let base = folder.appendingPathComponent(String(file.dropLast(".param".count))).path
            let model = try NCNNModel(paramPath: base + ".param", binPath: base + ".bin")
            let converted = try ModelConverter(model: model, tileSize: TileGeometry.defaultTileSize).convert()
            XCTAssertEqual(converted.scale, 4, file)
        }
    }
}
