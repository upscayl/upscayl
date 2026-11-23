import Foundation

enum ExitStatus {
    static let success: Int32 = 0
    static let failure: Int32 = 1
    /// Nothing was written, the app should run the same request with ncnn.
    static let useNcnn: Int32 = 3
}

/// Thrown when a model or an option is something this engine doesn't handle.
struct UnsupportedError: Error, CustomStringConvertible {
    let description: String

    init(_ message: String) {
        description = message
    }
}

/// Everything we tell the app goes to stderr, one line at a time, the way upscayl-bin does it.
final class Console {
    static let shared = Console()

    private let lock = NSLock()

    private init() {
        setvbuf(stderr, nil, _IOLBF, 0)
    }

    func say(_ text: String) {
        lock.lock()
        defer { lock.unlock() }
        FileHandle.standardError.write(Data((text + "\n").utf8))
    }
}
