import CryptoKit
import Foundation

struct NCNNLayer {
    var type: String
    var name: String
    var inputs: [String]
    var outputs: [String]
    var scalars: [Int: Double] = [:]
    var arrays: [Int: [Double]] = [:]

    func int(_ key: Int, _ fallback: Int) -> Int {
        scalars[key].map { Int($0) } ?? fallback
    }

    func double(_ key: Int, _ fallback: Double) -> Double {
        scalars[key] ?? fallback
    }
}

/// An ncnn model: the text graph (.param) and the weights (.bin).
struct NCNNModel {
    let layers: [NCNNLayer]
    let weights: Data
    /// Hash of both files. The converted model is cached under it.
    let fingerprint: String

    init(paramPath: String, binPath: String) throws {
        guard let text = try? String(contentsOfFile: paramPath, encoding: .utf8) else {
            throw UnsupportedError("cannot read \(paramPath)")
        }
        guard let bin = try? Data(contentsOf: URL(fileURLWithPath: binPath), options: .mappedIfSafe) else {
            throw UnsupportedError("cannot read \(binPath)")
        }
        try self.init(paramText: text, weights: bin)
    }

    init(paramText text: String, weights bin: Data) throws {
        let lines = text
            .split(whereSeparator: \.isNewline)
            .map(String.init)
            .filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
        // first line is the magic number, second one the layer and blob counts
        guard lines.count > 2, lines[0].trimmingCharacters(in: .whitespaces) == "7767517" else {
            throw UnsupportedError("not an ncnn param file")
        }

        var parsed: [NCNNLayer] = []
        for line in lines.dropFirst(2) {
            parsed.append(try NCNNModel.parseLayer(line))
        }
        layers = parsed
        weights = bin

        var digest = SHA256()
        digest.update(data: Data(text.utf8))
        digest.update(data: Data(String(bin.count).utf8))
        digest.update(data: bin.prefix(65536))
        digest.update(data: bin.suffix(65536))
        let hex = digest.finalize().map { String(format: "%02x", $0) }.joined()
        fingerprint = String(hex.prefix(16))
    }

    private static func parseLayer(_ line: String) throws -> NCNNLayer {
        let tokens = line.split(whereSeparator: { $0 == " " || $0 == "\t" }).map(String.init)
        guard tokens.count >= 4, let inputCount = Int(tokens[2]), let outputCount = Int(tokens[3]),
            tokens.count >= 4 + inputCount + outputCount
        else {
            throw UnsupportedError("bad layer line: \(line.prefix(60))")
        }

        let firstOutput = 4 + inputCount
        var layer = NCNNLayer(
            type: tokens[0],
            name: tokens[1],
            inputs: Array(tokens[4..<firstOutput]),
            outputs: Array(tokens[firstOutput..<(firstOutput + outputCount)]))

        for pair in tokens[(firstOutput + outputCount)...] {
            let parts = pair.split(separator: "=", maxSplits: 1).map(String.init)
            guard parts.count == 2, let key = Int(parts[0]) else {
                throw UnsupportedError("bad parameter \(pair)")
            }
            if key <= -23300 {
                // array parameter: the first number is the length, the rest are the values
                let values = parts[1].split(separator: ",").compactMap { Double($0) }
                layer.arrays[-(key + 23300)] = Array(values.dropFirst())
            } else if let value = Double(parts[1]) {
                layer.scalars[key] = value
            } else {
                throw UnsupportedError("bad parameter value \(pair)")
            }
        }
        return layer
    }
}

/// Reads the weight file from the start to the end, layer after layer, the way ncnn wrote it.
struct WeightReader {
    private let data: Data
    private(set) var position = 0

    init(_ data: Data) {
        self.data = data
    }

    var atEnd: Bool {
        position == data.count
    }

    private mutating func take(_ count: Int) throws -> Data {
        guard position + count <= data.count else {
            throw UnsupportedError("weight file is shorter than the graph")
        }
        let start = data.startIndex + position
        position += count
        return data.subdata(in: start..<(start + count))
    }

    /// `count` weights as little-endian fp16, whatever the file has in it.
    mutating func weights(_ count: Int) throws -> Data {
        let tag = try take(4).withUnsafeBytes { $0.loadUnaligned(as: UInt32.self) }
        switch tag {
        case 0x0130_6B47:
            // already fp16, padded to a multiple of four bytes
            let bytes = try take((count * 2 + 3) / 4 * 4)
            return bytes.prefix(count * 2)
        case 0, 0x0002_C056:
            return WeightReader.toHalf(try take(count * 4), count: count)
        default:
            throw UnsupportedError("weights are quantized (tag \(String(tag, radix: 16)))")
        }
    }

    /// `count` raw fp32 values (biases, PReLU slopes) as fp16.
    mutating func rawValues(_ count: Int) throws -> Data {
        WeightReader.toHalf(try take(count * 4), count: count)
    }

    private static func toHalf(_ floats: Data, count: Int) -> Data {
        var result = Data(count: count * 2)
        floats.withUnsafeBytes { (source: UnsafeRawBufferPointer) in
            result.withUnsafeMutableBytes { (target: UnsafeMutableRawBufferPointer) in
                for index in 0..<count {
                    let value = Float(bitPattern: source.loadUnaligned(fromByteOffset: index * 4, as: UInt32.self))
                    target.storeBytes(of: Float16(value).bitPattern, toByteOffset: index * 2, as: UInt16.self)
                }
            }
        }
        return result
    }
}
