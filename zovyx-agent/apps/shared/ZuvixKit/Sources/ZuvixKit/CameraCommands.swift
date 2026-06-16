import Foundation

public enum ZuvixCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum ZuvixCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum ZuvixCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum ZuvixCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct ZuvixCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: ZuvixCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: ZuvixCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: ZuvixCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: ZuvixCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct ZuvixCameraClipParams: Codable, Sendable, Equatable {
    public var facing: ZuvixCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: ZuvixCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: ZuvixCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: ZuvixCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
