import Foundation

public enum ZuvixDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum ZuvixBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum ZuvixThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum ZuvixNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum ZuvixNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct ZuvixBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: ZuvixBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: ZuvixBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct ZuvixThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: ZuvixThermalState

    public init(state: ZuvixThermalState) {
        self.state = state
    }
}

public struct ZuvixStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct ZuvixNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: ZuvixNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [ZuvixNetworkInterfaceType]

    public init(
        status: ZuvixNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [ZuvixNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct ZuvixDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: ZuvixBatteryStatusPayload
    public var thermal: ZuvixThermalStatusPayload
    public var storage: ZuvixStorageStatusPayload
    public var network: ZuvixNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: ZuvixBatteryStatusPayload,
        thermal: ZuvixThermalStatusPayload,
        storage: ZuvixStorageStatusPayload,
        network: ZuvixNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct ZuvixDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
