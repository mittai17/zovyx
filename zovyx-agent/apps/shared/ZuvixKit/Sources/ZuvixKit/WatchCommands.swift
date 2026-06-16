import Foundation

public enum ZuvixWatchCommand: String, Codable, Sendable {
    case status = "watch.status"
    case notify = "watch.notify"
}

public enum ZuvixWatchPayloadType: String, Codable, Sendable, Equatable {
    case notify = "watch.notify"
    case reply = "watch.reply"
    case execApprovalPrompt = "watch.execApproval.prompt"
    case execApprovalResolve = "watch.execApproval.resolve"
    case execApprovalResolved = "watch.execApproval.resolved"
    case execApprovalExpired = "watch.execApproval.expired"
    case execApprovalSnapshot = "watch.execApproval.snapshot"
    case execApprovalSnapshotRequest = "watch.execApproval.snapshotRequest"
}

public enum ZuvixWatchRisk: String, Codable, Sendable, Equatable {
    case low
    case medium
    case high
}

public enum ZuvixWatchExecApprovalDecision: String, Codable, Sendable, Equatable {
    case allowOnce = "allow-once"
    case deny
}

public enum ZuvixWatchExecApprovalCloseReason: String, Codable, Sendable, Equatable {
    case expired
    case notFound = "not-found"
    case unavailable
    case replaced
    case resolved
}

public struct ZuvixWatchAction: Codable, Sendable, Equatable {
    public var id: String
    public var label: String
    public var style: String?

    public init(id: String, label: String, style: String? = nil) {
        self.id = id
        self.label = label
        self.style = style
    }
}

public struct ZuvixWatchExecApprovalItem: Codable, Sendable, Equatable, Identifiable {
    public var id: String
    public var commandText: String
    public var commandPreview: String?
    public var host: String?
    public var nodeId: String?
    public var agentId: String?
    public var expiresAtMs: Int?
    public var allowedDecisions: [ZuvixWatchExecApprovalDecision]
    public var risk: ZuvixWatchRisk?

    public init(
        id: String,
        commandText: String,
        commandPreview: String? = nil,
        host: String? = nil,
        nodeId: String? = nil,
        agentId: String? = nil,
        expiresAtMs: Int? = nil,
        allowedDecisions: [ZuvixWatchExecApprovalDecision] = [],
        risk: ZuvixWatchRisk? = nil)
    {
        self.id = id
        self.commandText = commandText
        self.commandPreview = commandPreview
        self.host = host
        self.nodeId = nodeId
        self.agentId = agentId
        self.expiresAtMs = expiresAtMs
        self.allowedDecisions = allowedDecisions
        self.risk = risk
    }
}

public struct ZuvixWatchExecApprovalPromptMessage: Codable, Sendable, Equatable {
    public var type: ZuvixWatchPayloadType
    public var approval: ZuvixWatchExecApprovalItem
    public var sentAtMs: Int?
    public var deliveryId: String?
    public var resetResolvingState: Bool?

    public init(
        approval: ZuvixWatchExecApprovalItem,
        sentAtMs: Int? = nil,
        deliveryId: String? = nil,
        resetResolvingState: Bool? = nil)
    {
        self.type = .execApprovalPrompt
        self.approval = approval
        self.sentAtMs = sentAtMs
        self.deliveryId = deliveryId
        self.resetResolvingState = resetResolvingState
    }
}

public struct ZuvixWatchExecApprovalResolveMessage: Codable, Sendable, Equatable {
    public var type: ZuvixWatchPayloadType
    public var approvalId: String
    public var decision: ZuvixWatchExecApprovalDecision
    public var replyId: String
    public var sentAtMs: Int?

    public init(
        approvalId: String,
        decision: ZuvixWatchExecApprovalDecision,
        replyId: String,
        sentAtMs: Int? = nil)
    {
        self.type = .execApprovalResolve
        self.approvalId = approvalId
        self.decision = decision
        self.replyId = replyId
        self.sentAtMs = sentAtMs
    }
}

public struct ZuvixWatchExecApprovalResolvedMessage: Codable, Sendable, Equatable {
    public var type: ZuvixWatchPayloadType
    public var approvalId: String
    public var decision: ZuvixWatchExecApprovalDecision?
    public var resolvedAtMs: Int?
    public var source: String?

    public init(
        approvalId: String,
        decision: ZuvixWatchExecApprovalDecision? = nil,
        resolvedAtMs: Int? = nil,
        source: String? = nil)
    {
        self.type = .execApprovalResolved
        self.approvalId = approvalId
        self.decision = decision
        self.resolvedAtMs = resolvedAtMs
        self.source = source
    }
}

public struct ZuvixWatchExecApprovalExpiredMessage: Codable, Sendable, Equatable {
    public var type: ZuvixWatchPayloadType
    public var approvalId: String
    public var reason: ZuvixWatchExecApprovalCloseReason
    public var expiredAtMs: Int?

    public init(
        approvalId: String,
        reason: ZuvixWatchExecApprovalCloseReason,
        expiredAtMs: Int? = nil)
    {
        self.type = .execApprovalExpired
        self.approvalId = approvalId
        self.reason = reason
        self.expiredAtMs = expiredAtMs
    }
}

public struct ZuvixWatchExecApprovalSnapshotMessage: Codable, Sendable, Equatable {
    public var type: ZuvixWatchPayloadType
    public var approvals: [ZuvixWatchExecApprovalItem]
    public var sentAtMs: Int?
    public var snapshotId: String?

    public init(
        approvals: [ZuvixWatchExecApprovalItem],
        sentAtMs: Int? = nil,
        snapshotId: String? = nil)
    {
        self.type = .execApprovalSnapshot
        self.approvals = approvals
        self.sentAtMs = sentAtMs
        self.snapshotId = snapshotId
    }
}

public struct ZuvixWatchExecApprovalSnapshotRequestMessage: Codable, Sendable, Equatable {
    public var type: ZuvixWatchPayloadType
    public var requestId: String
    public var sentAtMs: Int?

    public init(requestId: String, sentAtMs: Int? = nil) {
        self.type = .execApprovalSnapshotRequest
        self.requestId = requestId
        self.sentAtMs = sentAtMs
    }
}

public struct ZuvixWatchStatusPayload: Codable, Sendable, Equatable {
    public var supported: Bool
    public var paired: Bool
    public var appInstalled: Bool
    public var reachable: Bool
    public var activationState: String

    public init(
        supported: Bool,
        paired: Bool,
        appInstalled: Bool,
        reachable: Bool,
        activationState: String)
    {
        self.supported = supported
        self.paired = paired
        self.appInstalled = appInstalled
        self.reachable = reachable
        self.activationState = activationState
    }
}

public struct ZuvixWatchNotifyParams: Codable, Sendable, Equatable {
    public var title: String
    public var body: String
    public var priority: ZuvixNotificationPriority?
    public var promptId: String?
    public var sessionKey: String?
    public var kind: String?
    public var details: String?
    public var expiresAtMs: Int?
    public var risk: ZuvixWatchRisk?
    public var actions: [ZuvixWatchAction]?

    public init(
        title: String,
        body: String,
        priority: ZuvixNotificationPriority? = nil,
        promptId: String? = nil,
        sessionKey: String? = nil,
        kind: String? = nil,
        details: String? = nil,
        expiresAtMs: Int? = nil,
        risk: ZuvixWatchRisk? = nil,
        actions: [ZuvixWatchAction]? = nil)
    {
        self.title = title
        self.body = body
        self.priority = priority
        self.promptId = promptId
        self.sessionKey = sessionKey
        self.kind = kind
        self.details = details
        self.expiresAtMs = expiresAtMs
        self.risk = risk
        self.actions = actions
    }
}

public struct ZuvixWatchNotifyPayload: Codable, Sendable, Equatable {
    public var deliveredImmediately: Bool
    public var queuedForDelivery: Bool
    public var transport: String

    public init(deliveredImmediately: Bool, queuedForDelivery: Bool, transport: String) {
        self.deliveredImmediately = deliveredImmediately
        self.queuedForDelivery = queuedForDelivery
        self.transport = transport
    }
}
