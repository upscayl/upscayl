import Foundation

/// Hands out tile numbers to the worker threads. A worker that can't finish a tile may give it back.
final class TileQueue {
    private let lock = NSLock()
    private let total: Int
    private var nextTile = 0
    private var returned: [Int] = []
    private var done = 0
    private var firstFailure: Error?

    init(total: Int) {
        self.total = total
    }

    /// The next tile to work on, or nil when there is nothing left or a worker has failed.
    func take() -> Int? {
        lock.lock()
        defer { lock.unlock() }
        if firstFailure != nil { return nil }
        if let tile = returned.popLast() { return tile }
        if nextTile < total {
            nextTile += 1
            return nextTile - 1
        }
        return nil
    }

    func giveBack(_ tile: Int) {
        lock.lock()
        returned.append(tile)
        lock.unlock()
    }

    /// Marks one tile as done and returns how many are done now.
    func markDone() -> Int {
        lock.lock()
        defer { lock.unlock() }
        done += 1
        return done
    }

    func fail(_ error: Error) {
        lock.lock()
        firstFailure = firstFailure ?? error
        lock.unlock()
    }

    var failure: Error? {
        lock.lock()
        defer { lock.unlock() }
        return firstFailure
    }

    var finished: Int {
        lock.lock()
        defer { lock.unlock() }
        return done
    }
}
