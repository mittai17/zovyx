import Foundation

// Stable identifier used for both the macOS LaunchAgent label and Nix-managed defaults suite.
// nix-zuvix writes app defaults into this suite to survive app bundle identifier churn.
let launchdLabel = "ai.zuvix.mac"
let gatewayLaunchdLabel = "ai.zuvix.gateway"
let onboardingVersionKey = "zuvix.onboardingVersion"
let onboardingSeenKey = "zuvix.onboardingSeen"
let currentOnboardingVersion = 7
let pauseDefaultsKey = "zuvix.pauseEnabled"
let iconAnimationsEnabledKey = "zuvix.iconAnimationsEnabled"
let swabbleEnabledKey = "zuvix.swabbleEnabled"
let swabbleTriggersKey = "zuvix.swabbleTriggers"
let voiceWakeTriggerChimeKey = "zuvix.voiceWakeTriggerChime"
let voiceWakeSendChimeKey = "zuvix.voiceWakeSendChime"
let showDockIconKey = "zuvix.showDockIcon"
let defaultVoiceWakeTriggers = ["zuvix"]
let voiceWakeMaxWords = 32
let voiceWakeMaxWordLength = 64
let voiceWakeMicKey = "zuvix.voiceWakeMicID"
let voiceWakeMicNameKey = "zuvix.voiceWakeMicName"
let voiceWakeLocaleKey = "zuvix.voiceWakeLocaleID"
let voiceWakeAdditionalLocalesKey = "zuvix.voiceWakeAdditionalLocaleIDs"
let voicePushToTalkEnabledKey = "zuvix.voicePushToTalkEnabled"
let voiceWakeTriggersTalkModeKey = "zuvix.voiceWakeTriggersTalkMode"
let talkEnabledKey = "zuvix.talkEnabled"
let talkPhaseSoundsEnabledKey = "zuvix.talkPhaseSoundsEnabled"
let talkShiftToStopEnabledKey = "zuvix.talkShiftToStopEnabled"
let iconOverrideKey = "zuvix.iconOverride"
let connectionModeKey = "zuvix.connectionMode"
let remoteTargetKey = "zuvix.remoteTarget"
let remoteIdentityKey = "zuvix.remoteIdentity"
let remoteProjectRootKey = "zuvix.remoteProjectRoot"
let remoteCliPathKey = "zuvix.remoteCliPath"
let canvasEnabledKey = "zuvix.canvasEnabled"
let cameraEnabledKey = "zuvix.cameraEnabled"
let systemRunPolicyKey = "zuvix.systemRunPolicy"
let systemRunAllowlistKey = "zuvix.systemRunAllowlist"
let systemRunEnabledKey = "zuvix.systemRunEnabled"
let locationModeKey = "zuvix.locationMode"
let locationPreciseKey = "zuvix.locationPreciseEnabled"
let peekabooBridgeEnabledKey = "zuvix.peekabooBridgeEnabled"
let deepLinkKeyKey = "zuvix.deepLinkKey"
let cliInstallPromptedVersionKey = "zuvix.cliInstallPromptedVersion"
let heartbeatsEnabledKey = "zuvix.heartbeatsEnabled"
let debugPaneEnabledKey = "zuvix.debugPaneEnabled"
let debugFileLogEnabledKey = "zuvix.debug.fileLogEnabled"
let appLogLevelKey = "zuvix.debug.appLogLevel"
let voiceWakeSupported: Bool = ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26
