import Foundation

/// Remembers the temporary file of the picture being saved, so a SIGTERM (the Stop button) can delete it.
final class TemporaryFile {
    static let current = TemporaryFile()

    private let lock = NSLock()
    private var url: URL?

    private init() {}

    func set(_ newURL: URL?) {
        lock.lock()
        url = newURL
        lock.unlock()
    }

    func removeFiles() {
        lock.lock()
        defer { lock.unlock() }
        guard let url else { return }
        let folder = url.deletingLastPathComponent()
        let name = url.lastPathComponent
        // ImageIO writes through a file of its own, named like ours with a dot in front and a suffix behind
        let entries = (try? FileManager.default.contentsOfDirectory(atPath: folder.path)) ?? []
        for entry in entries where entry.hasPrefix(name) || entry.hasPrefix("." + name) {
            try? FileManager.default.removeItem(at: folder.appendingPathComponent(entry))
        }
    }
}

/// The app stops a run with SIGTERM. Clean up the half written file, then let the signal do what it normally does.
enum StopSignals {
    private static var sources: [DispatchSourceSignal] = []

    static func install() {
        for number in [SIGTERM, SIGINT] {
            signal(number, SIG_IGN)
            let source = DispatchSource.makeSignalSource(signal: number, queue: .global())
            source.setEventHandler {
                TemporaryFile.current.removeFiles()
                signal(number, SIG_DFL)
                raise(number)
            }
            source.resume()
            sources.append(source)
        }
    }
}
