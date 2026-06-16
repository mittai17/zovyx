// swift-tools-version: 6.2
// Package manifest for the Zuvix macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "Zuvix",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "ZuvixIPC", targets: ["ZuvixIPC"]),
        .library(name: "ZuvixDiscovery", targets: ["ZuvixDiscovery"]),
        .executable(name: "Zuvix", targets: ["Zuvix"]),
        .executable(name: "zuvix-mac", targets: ["ZuvixMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.3.0"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.4.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.10.1"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.9.0"),
        .package(url: "https://github.com/steipete/Peekaboo.git", exact: "3.5.2"),
        .package(path: "../shared/ZuvixKit"),
        .package(path: "../swabble"),
    ],
    targets: [
        .target(
            name: "ZuvixIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "ZuvixDiscovery",
            dependencies: [
                .product(name: "ZuvixKit", package: "ZuvixKit"),
            ],
            path: "Sources/ZuvixDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "Zuvix",
            dependencies: [
                "ZuvixIPC",
                "ZuvixDiscovery",
                .product(name: "ZuvixKit", package: "ZuvixKit"),
                .product(name: "ZuvixChatUI", package: "ZuvixKit"),
                .product(name: "ZuvixProtocol", package: "ZuvixKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/Zuvix.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "ZuvixMacCLI",
            dependencies: [
                "ZuvixDiscovery",
                .product(name: "ZuvixKit", package: "ZuvixKit"),
                .product(name: "ZuvixProtocol", package: "ZuvixKit"),
            ],
            path: "Sources/ZuvixMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "ZuvixIPCTests",
            dependencies: [
                "ZuvixIPC",
                "Zuvix",
                "ZuvixMacCLI",
                "ZuvixDiscovery",
                .product(name: "ZuvixProtocol", package: "ZuvixKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
