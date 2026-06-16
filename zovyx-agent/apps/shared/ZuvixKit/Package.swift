// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "ZuvixKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "ZuvixProtocol", targets: ["ZuvixProtocol"]),
        .library(name: "ZuvixKit", targets: ["ZuvixKit"]),
        .library(name: "ZuvixChatUI", targets: ["ZuvixChatUI"]),
    ],
    traits: [
        .trait(name: "Talk", description: "ElevenLabs cloud TTS / talk support"),
        .default(enabledTraits: ["Talk"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.1"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "ZuvixProtocol",
            path: "Sources/ZuvixProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "ZuvixKit",
            dependencies: [
                "ZuvixProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit", condition: .when(traits: ["Talk"])),
            ],
            path: "Sources/ZuvixKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "ZuvixChatUI",
            dependencies: [
                "ZuvixKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/ZuvixChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "ZuvixKitTests",
            dependencies: ["ZuvixKit", "ZuvixChatUI"],
            path: "Tests/ZuvixKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
