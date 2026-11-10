import Foundation

/// Just enough protobuf to write the few Core ML messages the converter needs.
struct ProtobufWriter {
    private(set) var bytes = [UInt8]()

    mutating func varint(_ value: UInt64) {
        var rest = value
        while rest >= 0x80 {
            bytes.append(UInt8(rest & 0x7F) | 0x80)
            rest >>= 7
        }
        bytes.append(UInt8(rest))
    }

    private mutating func tag(_ field: Int, wireType: Int) {
        varint(UInt64(field << 3 | wireType))
    }

    mutating func uint(_ field: Int, _ value: Int) {
        tag(field, wireType: 0)
        varint(UInt64(value))
    }

    mutating func float(_ field: Int, _ value: Float) {
        tag(field, wireType: 5)
        withUnsafeBytes(of: value.bitPattern.littleEndian) { bytes.append(contentsOf: $0) }
    }

    mutating func string(_ field: Int, _ value: String) {
        let utf8 = Array(value.utf8)
        tag(field, wireType: 2)
        varint(UInt64(utf8.count))
        bytes.append(contentsOf: utf8)
    }

    mutating func data(_ field: Int, _ value: Data) {
        tag(field, wireType: 2)
        varint(UInt64(value.count))
        bytes.append(contentsOf: value)
    }

    /// A nested message, written by `body`.
    mutating func message(_ field: Int, _ body: (inout ProtobufWriter) -> Void) {
        var inner = ProtobufWriter()
        body(&inner)
        tag(field, wireType: 2)
        varint(UInt64(inner.bytes.count))
        bytes.append(contentsOf: inner.bytes)
    }

    /// Adds a message body that was encoded earlier.
    mutating func append(_ encoded: [UInt8]) {
        bytes.append(contentsOf: encoded)
    }

    mutating func packed(_ field: Int, _ values: [Int]) {
        var inner = ProtobufWriter()
        for value in values {
            inner.varint(UInt64(value))
        }
        tag(field, wireType: 2)
        varint(UInt64(inner.bytes.count))
        bytes.append(contentsOf: inner.bytes)
    }
}
