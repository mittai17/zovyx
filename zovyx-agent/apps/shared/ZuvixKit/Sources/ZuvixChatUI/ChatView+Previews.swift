import Foundation
import ZuvixKit
import SwiftUI

private struct ZuvixChatPreviewTransport: ZuvixChatTransport {
    enum Scenario {
        case connected
        case empty
        case loading
        case error
    }

    let scenario: Scenario

    init(scenario: Scenario = .connected) {
        self.scenario = scenario
    }

    func requestHistory(sessionKey: String) async throws -> ZuvixChatHistoryPayload {
        switch self.scenario {
        case .connected:
            break
        case .empty:
            return ZuvixChatHistoryPayload(
                sessionKey: sessionKey,
                sessionId: "preview-empty-session",
                messages: [],
                thinkingLevel: "medium")
        case .loading:
            try await Task.sleep(nanoseconds: 60_000_000_000)
            return ZuvixChatHistoryPayload(
                sessionKey: sessionKey,
                sessionId: "preview-loading-session",
                messages: [],
                thinkingLevel: "medium")
        case .error:
            throw NSError(
                domain: "ZuvixChatPreviewTransport",
                code: 1,
                userInfo: [NSLocalizedDescriptionKey: "Gateway not connected. Check Tailscale and retry."])
        }

        return ZuvixChatHistoryPayload(
            sessionKey: sessionKey,
            sessionId: "preview-session",
            messages: [
                Self.message(
                    role: "user",
                    text: "Can you check the gateway status and summarize anything risky?",
                    timestamp: 1),
                Self.message(
                    role: "assistant",
                    text: "Gateway is reachable. The only notable item is that push relay is still using local distribution, so device tests should stay on the local lane.",
                    timestamp: 2),
                Self.toolCall(
                    id: "tool-preview-1",
                    name: "gateway.status",
                    arguments: ["deep": AnyCodable(true)],
                    timestamp: 3),
                Self.toolResult(
                    toolCallId: "tool-preview-1",
                    name: "gateway.status",
                    text: "status=ok, channels=ios,macos, lastHeartbeat=12s",
                    timestamp: 4),
            ],
            thinkingLevel: "medium")
    }

    func listModels() async throws -> [ZuvixChatModelChoice] {
        [
            ZuvixChatModelChoice(
                modelID: "gpt-5.5",
                name: "GPT-5.5",
                provider: "openai",
                contextWindow: 400_000),
            ZuvixChatModelChoice(
                modelID: "sonnet-4.6",
                name: "Claude Sonnet 4.6",
                provider: "anthropic",
                contextWindow: 200_000),
        ]
    }

    func sendMessage(
        sessionKey _: String,
        message _: String,
        thinking _: String,
        idempotencyKey: String,
        attachments _: [ZuvixChatAttachmentPayload]) async throws -> ZuvixChatSendResponse
    {
        ZuvixChatSendResponse(runId: idempotencyKey, status: "ok")
    }

    func listSessions(limit _: Int?) async throws -> ZuvixChatSessionsListResponse {
        ZuvixChatSessionsListResponse(
            ts: 0,
            path: nil,
            count: 2,
            defaults: ZuvixChatSessionsDefaults(
                modelProvider: "openai",
                model: "gpt-5.5",
                contextTokens: 400_000,
                thinkingLevels: [
                    ZuvixChatThinkingLevelOption(id: "off", label: "off"),
                    ZuvixChatThinkingLevelOption(id: "medium", label: "medium"),
                    ZuvixChatThinkingLevelOption(id: "high", label: "high"),
                ],
                thinkingDefault: "medium",
                mainSessionKey: "main"),
            sessions: [
                Self.session(key: "main", displayName: "Main", updatedAt: 2),
                Self.session(key: "ios-preview", displayName: "iOS preview", updatedAt: 1),
            ])
    }

    func requestHealth(timeoutMs _: Int) async throws -> Bool {
        switch self.scenario {
        case .connected, .empty, .loading:
            true
        case .error:
            false
        }
    }

    func events() -> AsyncStream<ZuvixChatTransportEvent> {
        AsyncStream { continuation in
            continuation.finish()
        }
    }

    func setActiveSessionKey(_: String) async throws {}

    private static func message(role: String, text: String, timestamp: Double) -> AnyCodable {
        AnyCodable([
            "role": role,
            "content": [["type": "text", "text": text]],
            "timestamp": timestamp,
        ])
    }

    private static func toolCall(
        id: String,
        name: String,
        arguments: [String: AnyCodable],
        timestamp: Double) -> AnyCodable
    {
        AnyCodable([
            "role": "assistant",
            "content": [
                [
                    "type": "toolCall",
                    "id": id,
                    "name": name,
                    "arguments": AnyCodable(arguments),
                ],
            ],
            "timestamp": timestamp,
        ])
    }

    private static func toolResult(
        toolCallId: String,
        name: String,
        text: String,
        timestamp: Double) -> AnyCodable
    {
        AnyCodable([
            "role": "tool",
            "content": [["type": "text", "text": text]],
            "timestamp": timestamp,
            "toolCallId": toolCallId,
            "toolName": name,
        ])
    }

    private static func session(
        key: String,
        displayName: String,
        updatedAt: Double) -> ZuvixChatSessionEntry
    {
        ZuvixChatSessionEntry(
            key: key,
            kind: nil,
            displayName: displayName,
            surface: "ios",
            subject: nil,
            room: nil,
            space: nil,
            updatedAt: updatedAt,
            sessionId: nil,
            systemSent: nil,
            abortedLastRun: nil,
            thinkingLevel: "medium",
            verboseLevel: nil,
            inputTokens: 2500,
            outputTokens: 900,
            totalTokens: 3400,
            modelProvider: "openai",
            model: "gpt-5.5",
            contextTokens: 400_000)
    }
}

#Preview("Chat") {
    ZuvixChatPreview(scenario: .connected)
}

#Preview("Chat connected") {
    ZuvixChatPreview(scenario: .connected)
}

#Preview("Chat empty") {
    ZuvixChatPreview(
        scenario: .empty,
        sessionKey: "empty-preview")
}

#Preview("Chat loading") {
    ZuvixChatPreview(
        scenario: .loading,
        sessionKey: "loading-preview")
}

#Preview("Chat gateway error") {
    ZuvixChatPreview(
        scenario: .error,
        sessionKey: "error-preview")
}

#Preview("Onboarding chat") {
    ZuvixChatView(
        viewModel: ZuvixChatViewModel(
            sessionKey: "ios-preview",
            transport: ZuvixChatPreviewTransport()),
        showsSessionSwitcher: false,
        style: .onboarding,
        markdownVariant: .standard,
        userAccent: .blue)
}

private struct ZuvixChatPreview: View {
    let scenario: ZuvixChatPreviewTransport.Scenario
    var sessionKey: String = "main"

    var body: some View {
        ZuvixChatView(
            viewModel: ZuvixChatViewModel(
                sessionKey: self.sessionKey,
                transport: ZuvixChatPreviewTransport(scenario: self.scenario)),
            showsSessionSwitcher: true,
            style: .standard,
            markdownVariant: .standard,
            userAccent: .blue,
            showsAssistantTrace: true)
    }
}
