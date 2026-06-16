package ai.zuvix.app.node

import ai.zuvix.app.protocol.ZuvixCalendarCommand
import ai.zuvix.app.protocol.ZuvixCallLogCommand
import ai.zuvix.app.protocol.ZuvixCameraCommand
import ai.zuvix.app.protocol.ZuvixCanvasA2UICommand
import ai.zuvix.app.protocol.ZuvixCanvasCommand
import ai.zuvix.app.protocol.ZuvixCapability
import ai.zuvix.app.protocol.ZuvixContactsCommand
import ai.zuvix.app.protocol.ZuvixDeviceCommand
import ai.zuvix.app.protocol.ZuvixLocationCommand
import ai.zuvix.app.protocol.ZuvixMotionCommand
import ai.zuvix.app.protocol.ZuvixNotificationsCommand
import ai.zuvix.app.protocol.ZuvixPhotosCommand
import ai.zuvix.app.protocol.ZuvixSmsCommand
import ai.zuvix.app.protocol.ZuvixSystemCommand
import ai.zuvix.app.protocol.ZuvixTalkCommand

/** Runtime feature flags used to decide which node tools are advertised. */
data class NodeRuntimeFlags(
  val cameraEnabled: Boolean,
  val locationEnabled: Boolean,
  val sendSmsAvailable: Boolean,
  val readSmsAvailable: Boolean,
  val smsSearchPossible: Boolean,
  val callLogAvailable: Boolean,
  val photosAvailable: Boolean,
  val voiceWakeEnabled: Boolean,
  val motionActivityAvailable: Boolean,
  val motionPedometerAvailable: Boolean,
  val installedAppsSharingEnabled: Boolean,
  val debugBuild: Boolean,
)

/** Per-command availability gates checked before advertising invoke methods. */
enum class InvokeCommandAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SendSmsAvailable,
  ReadSmsAvailable,
  RequestableSmsSearchAvailable,
  CallLogAvailable,
  PhotosAvailable,
  MotionActivityAvailable,
  MotionPedometerAvailable,
  InstalledAppsSharingEnabled,
  DebugBuild,
}

/** Per-capability availability gates for the node capabilities manifest. */
enum class NodeCapabilityAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SmsAvailable,
  CallLogAvailable,
  PhotosAvailable,
  VoiceWakeEnabled,
  MotionAvailable,
}

/** Capability entry reported to the gateway when its availability gate passes. */
data class NodeCapabilitySpec(
  val name: String,
  val availability: NodeCapabilityAvailability = NodeCapabilityAvailability.Always,
)

/** Invoke method entry advertised to gateway plus foreground routing metadata. */
data class InvokeCommandSpec(
  val name: String,
  val requiresForeground: Boolean = false,
  val availability: InvokeCommandAvailability = InvokeCommandAvailability.Always,
)

object InvokeCommandRegistry {
  /** Capabilities mirror gateway protocol ids and are filtered by device state. */
  val capabilityManifest: List<NodeCapabilitySpec> =
    listOf(
      NodeCapabilitySpec(name = ZuvixCapability.Canvas.rawValue),
      NodeCapabilitySpec(name = ZuvixCapability.Device.rawValue),
      NodeCapabilitySpec(name = ZuvixCapability.Notifications.rawValue),
      NodeCapabilitySpec(name = ZuvixCapability.System.rawValue),
      NodeCapabilitySpec(
        name = ZuvixCapability.Camera.rawValue,
        availability = NodeCapabilityAvailability.CameraEnabled,
      ),
      NodeCapabilitySpec(
        name = ZuvixCapability.Sms.rawValue,
        availability = NodeCapabilityAvailability.SmsAvailable,
      ),
      NodeCapabilitySpec(
        name = ZuvixCapability.VoiceWake.rawValue,
        availability = NodeCapabilityAvailability.VoiceWakeEnabled,
      ),
      NodeCapabilitySpec(name = ZuvixCapability.Talk.rawValue),
      NodeCapabilitySpec(
        name = ZuvixCapability.Location.rawValue,
        availability = NodeCapabilityAvailability.LocationEnabled,
      ),
      NodeCapabilitySpec(
        name = ZuvixCapability.Photos.rawValue,
        availability = NodeCapabilityAvailability.PhotosAvailable,
      ),
      NodeCapabilitySpec(name = ZuvixCapability.Contacts.rawValue),
      NodeCapabilitySpec(name = ZuvixCapability.Calendar.rawValue),
      NodeCapabilitySpec(
        name = ZuvixCapability.Motion.rawValue,
        availability = NodeCapabilityAvailability.MotionAvailable,
      ),
      NodeCapabilitySpec(
        name = ZuvixCapability.CallLog.rawValue,
        availability = NodeCapabilityAvailability.CallLogAvailable,
      ),
    )

  /** Complete Android node command catalog before runtime availability filtering. */
  val all: List<InvokeCommandSpec> =
    listOf(
      InvokeCommandSpec(
        name = ZuvixCanvasCommand.Present.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ZuvixCanvasCommand.Hide.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ZuvixCanvasCommand.Navigate.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ZuvixCanvasCommand.Eval.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ZuvixCanvasCommand.Snapshot.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ZuvixCanvasA2UICommand.Push.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ZuvixCanvasA2UICommand.PushJSONL.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ZuvixCanvasA2UICommand.Reset.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = ZuvixSystemCommand.Notify.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixTalkCommand.PttStart.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixTalkCommand.PttStop.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixTalkCommand.PttCancel.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixTalkCommand.PttOnce.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixCameraCommand.List.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = ZuvixCameraCommand.Snap.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = ZuvixCameraCommand.Clip.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = ZuvixLocationCommand.Get.rawValue,
        availability = InvokeCommandAvailability.LocationEnabled,
      ),
      InvokeCommandSpec(
        name = ZuvixDeviceCommand.Status.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixDeviceCommand.Info.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixDeviceCommand.Permissions.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixDeviceCommand.Health.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixDeviceCommand.Apps.rawValue,
        availability = InvokeCommandAvailability.InstalledAppsSharingEnabled,
      ),
      InvokeCommandSpec(
        name = ZuvixNotificationsCommand.List.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixNotificationsCommand.Actions.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixPhotosCommand.Latest.rawValue,
        availability = InvokeCommandAvailability.PhotosAvailable,
      ),
      InvokeCommandSpec(
        name = ZuvixContactsCommand.Search.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixContactsCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixCalendarCommand.Events.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixCalendarCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = ZuvixMotionCommand.Activity.rawValue,
        availability = InvokeCommandAvailability.MotionActivityAvailable,
      ),
      InvokeCommandSpec(
        name = ZuvixMotionCommand.Pedometer.rawValue,
        availability = InvokeCommandAvailability.MotionPedometerAvailable,
      ),
      InvokeCommandSpec(
        name = ZuvixSmsCommand.Send.rawValue,
        availability = InvokeCommandAvailability.SendSmsAvailable,
      ),
      InvokeCommandSpec(
        name = ZuvixSmsCommand.Search.rawValue,
        availability = InvokeCommandAvailability.RequestableSmsSearchAvailable,
      ),
      InvokeCommandSpec(
        name = ZuvixCallLogCommand.Search.rawValue,
        availability = InvokeCommandAvailability.CallLogAvailable,
      ),
      InvokeCommandSpec(
        name = "debug.logs",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
      InvokeCommandSpec(
        name = "debug.ed25519",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
    )

  private val byNameInternal: Map<String, InvokeCommandSpec> = all.associateBy { it.name }

  /** Finds the command metadata used by dispatch and advertised-method builders. */
  fun find(command: String): InvokeCommandSpec? = byNameInternal[command]

  /** Returns gateway capability ids the current Android device can actually serve. */
  fun advertisedCapabilities(flags: NodeRuntimeFlags): List<String> =
    capabilityManifest
      .filter { spec ->
        when (spec.availability) {
          NodeCapabilityAvailability.Always -> true
          NodeCapabilityAvailability.CameraEnabled -> flags.cameraEnabled
          NodeCapabilityAvailability.LocationEnabled -> flags.locationEnabled
          NodeCapabilityAvailability.SmsAvailable -> flags.sendSmsAvailable || flags.readSmsAvailable
          NodeCapabilityAvailability.CallLogAvailable -> flags.callLogAvailable
          NodeCapabilityAvailability.PhotosAvailable -> flags.photosAvailable
          NodeCapabilityAvailability.VoiceWakeEnabled -> flags.voiceWakeEnabled
          NodeCapabilityAvailability.MotionAvailable -> flags.motionActivityAvailable || flags.motionPedometerAvailable
        }
      }.map { it.name }

  /** Returns gateway invoke method ids available under current permissions/build flags. */
  fun advertisedCommands(flags: NodeRuntimeFlags): List<String> =
    all
      .filter { spec ->
        when (spec.availability) {
          InvokeCommandAvailability.Always -> true
          InvokeCommandAvailability.CameraEnabled -> flags.cameraEnabled
          InvokeCommandAvailability.LocationEnabled -> flags.locationEnabled
          InvokeCommandAvailability.SendSmsAvailable -> flags.sendSmsAvailable
          InvokeCommandAvailability.ReadSmsAvailable -> flags.readSmsAvailable
          InvokeCommandAvailability.RequestableSmsSearchAvailable -> flags.smsSearchPossible
          InvokeCommandAvailability.CallLogAvailable -> flags.callLogAvailable
          InvokeCommandAvailability.PhotosAvailable -> flags.photosAvailable
          InvokeCommandAvailability.MotionActivityAvailable -> flags.motionActivityAvailable
          InvokeCommandAvailability.MotionPedometerAvailable -> flags.motionPedometerAvailable
          InvokeCommandAvailability.InstalledAppsSharingEnabled -> flags.installedAppsSharingEnabled
          InvokeCommandAvailability.DebugBuild -> flags.debugBuild
        }
      }.map { it.name }
}
