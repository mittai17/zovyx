import CoreLocation
import Foundation
import ZuvixKit
import UIKit

typealias ZuvixCameraSnapResult = (format: String, base64: String, width: Int, height: Int)
typealias ZuvixCameraClipResult = (format: String, base64: String, durationMs: Int, hasAudio: Bool)

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: ZuvixCameraSnapParams) async throws -> ZuvixCameraSnapResult
    func clip(params: ZuvixCameraClipParams) async throws -> ZuvixCameraClipResult
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: ZuvixLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: ZuvixLocationGetParams,
        desiredAccuracy: ZuvixLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
}

@MainActor
protocol DeviceStatusServicing: Sendable {
    func status() async throws -> ZuvixDeviceStatusPayload
    func info() -> ZuvixDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: ZuvixPhotosLatestParams) async throws -> ZuvixPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: ZuvixContactsSearchParams) async throws -> ZuvixContactsSearchPayload
    func add(params: ZuvixContactsAddParams) async throws -> ZuvixContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: ZuvixCalendarEventsParams) async throws -> ZuvixCalendarEventsPayload
    func add(params: ZuvixCalendarAddParams) async throws -> ZuvixCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: ZuvixRemindersListParams) async throws -> ZuvixRemindersListPayload
    func add(params: ZuvixRemindersAddParams) async throws -> ZuvixRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: ZuvixMotionActivityParams) async throws -> ZuvixMotionActivityPayload
    func pedometer(params: ZuvixPedometerParams) async throws -> ZuvixPedometerPayload
}

struct WatchMessagingStatus: Equatable {
    var supported: Bool
    var paired: Bool
    var appInstalled: Bool
    var reachable: Bool
    var activationState: String
}

struct WatchQuickReplyEvent: Equatable {
    var replyId: String
    var promptId: String
    var actionId: String
    var actionLabel: String?
    var sessionKey: String?
    var note: String?
    var sentAtMs: Int?
    var transport: String
}

struct WatchExecApprovalResolveEvent: Equatable {
    var replyId: String
    var approvalId: String
    var decision: ZuvixWatchExecApprovalDecision
    var sentAtMs: Int?
    var transport: String
}

struct WatchExecApprovalSnapshotRequestEvent: Equatable {
    var requestId: String
    var sentAtMs: Int?
    var transport: String
}

struct WatchNotificationSendResult: Equatable {
    var deliveredImmediately: Bool
    var queuedForDelivery: Bool
    var transport: String
}

protocol WatchMessagingServicing: AnyObject, Sendable {
    func status() async -> WatchMessagingStatus
    func setStatusHandler(_ handler: (@Sendable (WatchMessagingStatus) -> Void)?)
    func setReplyHandler(_ handler: (@Sendable (WatchQuickReplyEvent) -> Void)?)
    func setExecApprovalResolveHandler(_ handler: (@Sendable (WatchExecApprovalResolveEvent) -> Void)?)
    func setExecApprovalSnapshotRequestHandler(
        _ handler: (@Sendable (WatchExecApprovalSnapshotRequestEvent) -> Void)?)
    func sendNotification(
        id: String,
        params: ZuvixWatchNotifyParams) async throws -> WatchNotificationSendResult
    func sendExecApprovalPrompt(
        _ message: ZuvixWatchExecApprovalPromptMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalResolved(
        _ message: ZuvixWatchExecApprovalResolvedMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalExpired(
        _ message: ZuvixWatchExecApprovalExpiredMessage) async throws -> WatchNotificationSendResult
    func syncExecApprovalSnapshot(
        _ message: ZuvixWatchExecApprovalSnapshotMessage) async throws -> WatchNotificationSendResult
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
