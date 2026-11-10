import Foundation

/// Hands out tile numbers to the worker threads. A worker that can't finish a tile may give it back.
final class TileQueue {
    private let condition = NSCondition()
    private let total: Int
    private var nextTile = 0
    private var returned: [Int] = []
    private var inFlight = 0
    private var done = 0
    private var firstFailure: Error?

    init(total: Int) {
        self.total = total
    }

    /// The next tile to work on, or nil when there is nothing left or a worker has failed.
    ///
    /// When the queue is empty but another worker still holds a tile it may give back, a worker that passes
    /// `canWait` sleeps until that is settled. Otherwise a tile given back after everybody else has left would
    /// never be done.
    func take(canWait: Bool = false) -> Int? {
        condition.lock()
        defer { condition.unlock() }
        while true {
            if firstFailure != nil { return nil }
            if let tile = returned.popLast() {
                inFlight += 1
                return tile
            }
            if nextTile < total {
                nextTile += 1
                inFlight += 1
                return nextTile - 1
            }
            if !canWait || inFlight == 0 { return nil }
            condition.wait()
        }
    }

    func giveBack(_ tile: Int) {
        condition.lock()
        returned.append(tile)
        inFlight -= 1
        condition.broadcast()
        condition.unlock()
    }

    /// Marks one tile as done and returns how many are done now.
    func markDone() -> Int {
        condition.lock()
        defer { condition.unlock() }
        done += 1
        inFlight -= 1
        condition.broadcast()
        return done
    }

    func fail(_ error: Error) {
        condition.lock()
        firstFailure = firstFailure ?? error
        condition.broadcast()
        condition.unlock()
    }

    var failure: Error? {
        condition.lock()
        defer { condition.unlock() }
        return firstFailure
    }

    var finished: Int {
        condition.lock()
        defer { condition.unlock() }
        return done
    }
}
