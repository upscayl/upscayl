import XCTest

@testable import UpscaylCoreML

final class TileGeometryTests: XCTestCase {
    func testCountsTilesAndKeepsTheStep() {
        let geometry = TileGeometry(imageWidth: 1000, imageHeight: 500, scale: 4)
        XCTAssertEqual(geometry.step, 224)
        XCTAssertEqual(geometry.columns, 5)
        XCTAssertEqual(geometry.rows, 3)
        XCTAssertEqual(geometry.tileCount, 15)
        XCTAssertEqual(geometry.outputWidth, 4000)
        XCTAssertEqual(geometry.outputHeight, 2000)
        XCTAssertEqual(geometry.upscaledTileSize, 1024)
    }

    func testASmallImageIsOneTile() {
        let geometry = TileGeometry(imageWidth: 16, imageHeight: 16, scale: 4)
        XCTAssertEqual(geometry.tileCount, 1)
    }

    func testTilesCoverTheWholeImage() {
        for (width, height) in [(1, 1), (223, 224), (224, 225), (700, 31)] {
            let geometry = TileGeometry(imageWidth: width, imageHeight: height, scale: 2)
            XCTAssertGreaterThanOrEqual(geometry.columns * geometry.step, width)
            XCTAssertGreaterThanOrEqual(geometry.rows * geometry.step, height)
            XCTAssertLessThan((geometry.columns - 1) * geometry.step, width)
            XCTAssertLessThan((geometry.rows - 1) * geometry.step, height)
        }
    }
}

final class OrientationTests: XCTestCase {
    func testThereAreEightDifferentOrientations() {
        XCTAssertEqual(Orientation.all.count, 8)
        // where the corner (0, 0) of a 3x3 square goes tells them apart
        let corners = Set(Orientation.all.map { orientation -> String in
            let spot = orientation.target(x: 0, y: 1, size: 3)
            let other = orientation.target(x: 1, y: 0, size: 3)
            return "\(spot) \(other)"
        })
        XCTAssertEqual(corners.count, 8)
    }

    func testTargetUndoesSource() {
        let size = 5
        for orientation in Orientation.all {
            for y in 0..<size {
                for x in 0..<size {
                    let from = orientation.source(x: x, y: y, size: size)
                    let back = orientation.target(x: from.x, y: from.y, size: size)
                    XCTAssertEqual(back.x, x)
                    XCTAssertEqual(back.y, y)
                }
            }
        }
    }

    func testTheIdentityKeepsPixelsInPlace() {
        let identity = Orientation(index: 0)
        XCTAssertEqual(identity.source(x: 2, y: 3, size: 8).x, 2)
        XCTAssertEqual(identity.source(x: 2, y: 3, size: 8).y, 3)
    }
}

final class TileQueueTests: XCTestCase {
    func testHandsOutEveryTileOnce() {
        let queue = TileQueue(total: 4)
        var taken: [Int] = []
        while let tile = queue.take() {
            taken.append(tile)
        }
        XCTAssertEqual(taken, [0, 1, 2, 3])
    }

    func testAGivenBackTileComesAgain() {
        let queue = TileQueue(total: 2)
        let first = queue.take()
        queue.giveBack(first!)
        XCTAssertEqual(queue.take(), first)
        XCTAssertEqual(queue.take(), 1)
        XCTAssertNil(queue.take())
    }

    func testAFailureStopsTheQueue() {
        struct Boom: Error {}
        let queue = TileQueue(total: 10)
        _ = queue.take()
        queue.fail(Boom())
        XCTAssertNil(queue.take())
        XCTAssertNotNil(queue.failure)
    }

    /// Runs `queue.take(canWait: true)` on another thread and reports what it got.
    private func waitingTake(_ queue: TileQueue) -> (arrived: DispatchSemaphore, result: () -> Int?) {
        let arrived = DispatchSemaphore(value: 0)
        let box = Box()
        DispatchQueue.global().async {
            box.value = queue.take(canWait: true)
            arrived.signal()
        }
        return (arrived, { box.value })
    }

    private final class Box {
        var value: Int?
    }

    func testAWaitingWorkerGetsATileThatIsGivenBackLate() {
        let queue = TileQueue(total: 1)
        XCTAssertEqual(queue.take(), 0)  // a helper holds the only tile

        let (arrived, result) = waitingTake(queue)
        XCTAssertEqual(arrived.wait(timeout: .now() + 0.2), .timedOut, "it should still be waiting")

        queue.giveBack(0)
        XCTAssertEqual(arrived.wait(timeout: .now() + 5), .success)
        XCTAssertEqual(result(), 0)
    }

    func testAWaitingWorkerLeavesWhenTheLastTileIsDone() {
        let queue = TileQueue(total: 1)
        XCTAssertEqual(queue.take(), 0)

        let (arrived, result) = waitingTake(queue)
        XCTAssertEqual(arrived.wait(timeout: .now() + 0.2), .timedOut)

        XCTAssertEqual(queue.markDone(), 1)
        XCTAssertEqual(arrived.wait(timeout: .now() + 5), .success)
        XCTAssertNil(result())
    }

    func testAWaitingWorkerLeavesOnFailure() {
        struct Boom: Error {}
        let queue = TileQueue(total: 1)
        XCTAssertEqual(queue.take(), 0)

        let (arrived, result) = waitingTake(queue)
        XCTAssertEqual(arrived.wait(timeout: .now() + 0.2), .timedOut)

        queue.fail(Boom())
        XCTAssertEqual(arrived.wait(timeout: .now() + 5), .success)
        XCTAssertNil(result())
    }

    func testCountsFinishedTilesFromManyThreads() {
        let queue = TileQueue(total: 400)
        DispatchQueue.concurrentPerform(iterations: 4) { _ in
            while queue.take() != nil {
                _ = queue.markDone()
            }
        }
        XCTAssertEqual(queue.finished, 400)
    }
}
