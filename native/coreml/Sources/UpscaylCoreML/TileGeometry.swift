import Foundation

/// How an image is cut into tiles. Neighbouring tiles overlap by `padding` pixels on every side, the overlap
/// is thrown away after upscaling so the seams don't show.
struct TileGeometry {
    /// The converted model takes exactly this many pixels per side.
    static let defaultTileSize = 256
    static let defaultPadding = 16

    let imageWidth: Int
    let imageHeight: Int
    let scale: Int
    let tileSize: Int
    let padding: Int

    init(imageWidth: Int, imageHeight: Int, scale: Int,
         tileSize: Int = TileGeometry.defaultTileSize, padding: Int = TileGeometry.defaultPadding) {
        self.imageWidth = imageWidth
        self.imageHeight = imageHeight
        self.scale = scale
        self.tileSize = tileSize
        self.padding = padding
    }

    /// Pixels of a tile that are kept after cutting the overlap off.
    var step: Int { tileSize - 2 * padding }
    var columns: Int { (imageWidth + step - 1) / step }
    var rows: Int { (imageHeight + step - 1) / step }
    var tileCount: Int { columns * rows }
    var outputWidth: Int { imageWidth * scale }
    var outputHeight: Int { imageHeight * scale }
    var upscaledTileSize: Int { tileSize * scale }
}

/// One of the eight ways to flip and turn a square. Test time augmentation runs the model on all of them.
struct Orientation {
    let flipHorizontal: Bool
    let flipVertical: Bool
    let transpose: Bool

    static let all = (0..<8).map { Orientation(index: $0) }

    init(index: Int) {
        flipHorizontal = index & 1 != 0
        flipVertical = index & 2 != 0
        transpose = index & 4 != 0
    }

    /// Where pixel (x, y) of the turned square comes from in the original.
    func source(x: Int, y: Int, size: Int) -> (x: Int, y: Int) {
        var first = flipHorizontal ? size - 1 - x : x
        var second = flipVertical ? size - 1 - y : y
        if transpose { swap(&first, &second) }
        return (first, second)
    }

    /// The opposite direction: where pixel (x, y) of the original lands in the turned square.
    func target(x: Int, y: Int, size: Int) -> (x: Int, y: Int) {
        var first = x
        var second = y
        if transpose { swap(&first, &second) }
        return (flipHorizontal ? size - 1 - first : first, flipVertical ? size - 1 - second : second)
    }
}
