import Foundation

public enum ZuvixRemindersCommand: String, Codable, Sendable {
    case list = "reminders.list"
    case add = "reminders.add"
}

public enum ZuvixReminderStatusFilter: String, Codable, Sendable {
    case incomplete
    case completed
    case all
}

public struct ZuvixRemindersListParams: Codable, Sendable, Equatable {
    public var status: ZuvixReminderStatusFilter?
    public var limit: Int?

    public init(status: ZuvixReminderStatusFilter? = nil, limit: Int? = nil) {
        self.status = status
        self.limit = limit
    }
}

public struct ZuvixRemindersAddParams: Codable, Sendable, Equatable {
    public var title: String
    public var dueISO: String?
    public var notes: String?
    public var listId: String?
    public var listName: String?

    public init(
        title: String,
        dueISO: String? = nil,
        notes: String? = nil,
        listId: String? = nil,
        listName: String? = nil)
    {
        self.title = title
        self.dueISO = dueISO
        self.notes = notes
        self.listId = listId
        self.listName = listName
    }
}

public struct ZuvixReminderPayload: Codable, Sendable, Equatable {
    public var identifier: String
    public var title: String
    public var dueISO: String?
    public var completed: Bool
    public var listName: String?

    public init(
        identifier: String,
        title: String,
        dueISO: String? = nil,
        completed: Bool,
        listName: String? = nil)
    {
        self.identifier = identifier
        self.title = title
        self.dueISO = dueISO
        self.completed = completed
        self.listName = listName
    }
}

public struct ZuvixRemindersListPayload: Codable, Sendable, Equatable {
    public var reminders: [ZuvixReminderPayload]

    public init(reminders: [ZuvixReminderPayload]) {
        self.reminders = reminders
    }
}

public struct ZuvixRemindersAddPayload: Codable, Sendable, Equatable {
    public var reminder: ZuvixReminderPayload

    public init(reminder: ZuvixReminderPayload) {
        self.reminder = reminder
    }
}
