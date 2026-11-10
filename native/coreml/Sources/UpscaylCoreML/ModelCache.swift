import CoreML
import Foundation

/// Converts a model the first time it is used and keeps the compiled result in a folder.
/// The file name carries a hash of the model files, so an edited model gets a new entry.
final class ModelCache {
    /// Bump when the converter changes what it writes.
    private static let version = "v2"

    private let folder: URL
    private let tileSize: Int

    init(folder: URL, tileSize: Int) {
        self.folder = folder
        self.tileSize = tileSize
    }

    func compiledModel(for model: NCNNModel, name: String, report: (String) -> Void) throws -> URL {
        let fileManager = FileManager.default
        try fileManager.createDirectory(at: folder, withIntermediateDirectories: true)

        let safeName = String(name.map { $0.isLetter || $0.isNumber || $0 == "-" || $0 == "_" ? $0 : "_" })
        let prefix = safeName + "-"
        let cached = folder.appendingPathComponent(
            "\(prefix)\(model.fingerprint)-t\(tileSize)-\(ModelCache.version).mlmodelc")
        if fileManager.fileExists(atPath: cached.path) {
            return cached
        }

        report("Preparing the Core ML model, this happens once")
        let converted = try ModelConverter(model: model, tileSize: tileSize).convert()
        let source = folder.appendingPathComponent("\(UUID().uuidString).mlmodel")
        try Data(converted.bytes).write(to: source)
        defer { try? fileManager.removeItem(at: source) }

        let compiled = try MLModel.compileModel(at: source)
        defer { try? fileManager.removeItem(at: compiled) }
        if fileManager.fileExists(atPath: cached.path) {
            try fileManager.removeItem(at: cached)
        }
        try fileManager.moveItem(at: compiled, to: cached)

        removeOldEntries(prefix: prefix, keeping: cached.lastPathComponent)
        return cached
    }

    /// Earlier conversions of the same model (an edited custom model, an older converter) are of no use any more.
    private func removeOldEntries(prefix: String, keeping current: String) {
        guard let entries = try? FileManager.default.contentsOfDirectory(atPath: folder.path) else { return }
        for entry in entries where entry != current && ModelCache.isEntry(entry, withPrefix: prefix) {
            try? FileManager.default.removeItem(at: folder.appendingPathComponent(entry))
        }
    }

    /// True for "<prefix><fingerprint>-t<tile>-v<version>.mlmodelc". A plain prefix test isn't enough, the entries
    /// of a model called "name-anime" also start with "name-".
    static func isEntry(_ file: String, withPrefix prefix: String) -> Bool {
        guard file.hasPrefix(prefix) else { return false }
        let rest = file.dropFirst(prefix.count)
        return rest.range(of: "^[0-9a-f]{16}-t[0-9]+-v[0-9]+\\.mlmodelc$", options: .regularExpression) != nil
    }
}
