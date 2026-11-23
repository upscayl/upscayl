import XCTest

@testable import UpscaylCoreML

/// Bytes of a weight file: a tag, then little-endian floats.
func floatBytes(_ values: [Float], tag: UInt32? = nil) -> Data {
    var data = Data()
    if var tag {
        withUnsafeBytes(of: &tag) { data.append(contentsOf: $0) }
    }
    for var value in values {
        withUnsafeBytes(of: &value) { data.append(contentsOf: $0) }
    }
    return data
}

final class NCNNModelTests: XCTestCase {
    func testParsesLayersAndParameters() throws {
        let text = """
            7767517
            3 3
            Input data 0 1 data
            Convolution conv1 1 1 data out 0=8 1=3 -23310=2,0.5,0.25
            ReLU relu1 1 1 out out2 0=0.1
            """
        let model = try NCNNModel(paramText: text, weights: Data())
        XCTAssertEqual(model.layers.count, 3)

        let conv = model.layers[1]
        XCTAssertEqual(conv.type, "Convolution")
        XCTAssertEqual(conv.name, "conv1")
        XCTAssertEqual(conv.inputs, ["data"])
        XCTAssertEqual(conv.outputs, ["out"])
        XCTAssertEqual(conv.int(0, 0), 8)
        XCTAssertEqual(conv.int(99, 7), 7)
        XCTAssertEqual(conv.arrays[10], [0.5, 0.25])
        XCTAssertEqual(model.layers[2].double(0, 0), 0.1)
    }

    func testRejectsAFileThatIsNotNcnn() {
        XCTAssertThrowsError(try NCNNModel(paramText: "hello\nworld\nthree", weights: Data()))
    }

    func testRejectsABrokenLayerLine() {
        let text = "7767517\n1 1\nConvolution conv1 3 1 a b"
        XCTAssertThrowsError(try NCNNModel(paramText: text, weights: Data()))
    }

    func testFingerprintFollowsTheFiles() throws {
        let text = "7767517\n1 1\nInput data 0 1 data"
        let first = try NCNNModel(paramText: text, weights: Data([1, 2, 3]))
        let same = try NCNNModel(paramText: text, weights: Data([1, 2, 3]))
        let other = try NCNNModel(paramText: text, weights: Data([1, 2, 4]))
        XCTAssertEqual(first.fingerprint, same.fingerprint)
        XCTAssertNotEqual(first.fingerprint, other.fingerprint)
        XCTAssertEqual(first.fingerprint.count, 16)
    }
}

final class WeightReaderTests: XCTestCase {
    private func halfValues(_ data: Data) -> [Float] {
        (0..<data.count / 2).map { index in
            let bits = data.withUnsafeBytes { $0.loadUnaligned(fromByteOffset: index * 2, as: UInt16.self) }
            return Float(Float16(bitPattern: bits))
        }
    }

    func testConvertsFloat32WeightsToHalf() throws {
        var reader = WeightReader(floatBytes([1, -2, 0.5], tag: 0))
        let weights = try reader.weights(3)
        XCTAssertEqual(halfValues(weights), [1, -2, 0.5])
        XCTAssertTrue(reader.atEnd)
    }

    func testKeepsHalfWeightsAndSkipsThePadding() throws {
        var data = Data()
        var tag: UInt32 = 0x0130_6B47
        withUnsafeBytes(of: &tag) { data.append(contentsOf: $0) }
        for value in [Float16(1), Float16(2), Float16(3)] {
            var bits = value.bitPattern
            withUnsafeBytes(of: &bits) { data.append(contentsOf: $0) }
        }
        data.append(contentsOf: [0, 0])  // three halves are six bytes, padded to eight

        var reader = WeightReader(data)
        XCTAssertEqual(halfValues(try reader.weights(3)), [1, 2, 3])
        XCTAssertTrue(reader.atEnd)
    }

    func testRawValuesHaveNoTag() throws {
        var reader = WeightReader(floatBytes([0.25, 4]))
        XCTAssertEqual(halfValues(try reader.rawValues(2)), [0.25, 4])
        XCTAssertTrue(reader.atEnd)
    }

    func testQuantizedWeightsAreRefused() {
        var reader = WeightReader(floatBytes([1, 2], tag: 0xDEAD_BEEF))
        XCTAssertThrowsError(try reader.weights(2))
    }

    func testReadingPastTheEndFails() {
        var reader = WeightReader(floatBytes([1], tag: 0))
        XCTAssertThrowsError(try reader.weights(5))
    }
}

final class ProtobufWriterTests: XCTestCase {
    func testVarintUsesSevenBitGroups() {
        var writer = ProtobufWriter()
        writer.varint(1)
        writer.varint(300)
        XCTAssertEqual(writer.bytes, [0x01, 0xAC, 0x02])
    }

    func testFieldsCarryTheirTag() {
        var writer = ProtobufWriter()
        writer.uint(1, 150)
        writer.string(2, "hi")
        XCTAssertEqual(writer.bytes, [0x08, 0x96, 0x01, 0x12, 0x02, 0x68, 0x69])
    }

    func testNestedMessageIsLengthPrefixed() {
        var writer = ProtobufWriter()
        writer.message(3) { $0.uint(1, 5) }
        XCTAssertEqual(writer.bytes, [0x1A, 0x02, 0x08, 0x05])
    }

    func testPackedValues() {
        var writer = ProtobufWriter()
        writer.packed(4, [3, 270])
        XCTAssertEqual(writer.bytes, [0x22, 0x03, 0x03, 0x8E, 0x02])
    }

    func testFloatIsLittleEndian() {
        var writer = ProtobufWriter()
        writer.float(1, 1.0)
        XCTAssertEqual(writer.bytes, [0x0D, 0x00, 0x00, 0x80, 0x3F])
    }
}
