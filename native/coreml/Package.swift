// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "upscayl-coreml",
    platforms: [.macOS(.v12)],
    products: [
        .executable(name: "upscayl-coreml", targets: ["upscayl-coreml"])
    ],
    targets: [
        .target(name: "UpscaylCoreML"),
        .executableTarget(name: "upscayl-coreml", dependencies: ["UpscaylCoreML"]),
        .testTarget(name: "UpscaylCoreMLTests", dependencies: ["UpscaylCoreML"]),
    ]
)
