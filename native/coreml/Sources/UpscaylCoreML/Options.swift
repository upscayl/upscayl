import Foundation

/// Which compute units run the tiles.
enum ComputeMode: String {
    case hybrid, gpu, ane
}

/// The command line. Same flags as upscayl-bin, plus --cache and --units.
struct Options {
    var input = ""
    var output = ""
    var modelsFolder = ""
    var modelName = ""
    var scale: Double?
    var width: Int?
    var format = "png"
    var compression = 0
    var cacheFolder: String?
    var mode = ComputeMode.hybrid
    var tta = false

    private static let flagsWithValue: Set<String> = [
        "-i", "-o", "-m", "-n", "-s", "-w", "-f", "-c", "--cache", "--units",
    ]

    init(arguments: [String]) {
        var rest = arguments[...]
        while let flag = rest.popFirst() {
            if flag == "-x" {
                tta = true
                continue
            }
            guard Options.flagsWithValue.contains(flag) else {
                // -t, -g and the like do nothing here, skip their value as well (if they have one)
                if let next = rest.first, !next.hasPrefix("-") {
                    rest.removeFirst()
                }
                continue
            }
            guard let value = rest.popFirst() else { break }
            switch flag {
            case "-i": input = value
            case "-o": output = value
            case "-m": modelsFolder = value
            case "-n": modelName = value
            case "-s": scale = Double(value)
            case "-w": width = Int(value)
            case "-f": format = value.lowercased()
            case "-c": compression = Int(value) ?? 0
            case "--cache": cacheFolder = value
            case "--units": mode = ComputeMode(rawValue: value) ?? .hybrid
            default: break
            }
        }
    }
}
