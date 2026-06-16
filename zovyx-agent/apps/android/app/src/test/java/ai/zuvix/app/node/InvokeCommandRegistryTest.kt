package ai.zuvix.app.node

import ai.zuvix.app.protocol.ZuvixCalendarCommand
import ai.zuvix.app.protocol.ZuvixCallLogCommand
import ai.zuvix.app.protocol.ZuvixCameraCommand
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
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class InvokeCommandRegistryTest {
  private val coreCapabilities =
    setOf(
      ZuvixCapability.Canvas.rawValue,
      ZuvixCapability.Device.rawValue,
      ZuvixCapability.Notifications.rawValue,
      ZuvixCapability.System.rawValue,
      ZuvixCapability.Talk.rawValue,
      ZuvixCapability.Contacts.rawValue,
      ZuvixCapability.Calendar.rawValue,
    )

  private val optionalCapabilities =
    setOf(
      ZuvixCapability.Camera.rawValue,
      ZuvixCapability.Location.rawValue,
      ZuvixCapability.Sms.rawValue,
      ZuvixCapability.CallLog.rawValue,
      ZuvixCapability.VoiceWake.rawValue,
      ZuvixCapability.Motion.rawValue,
      ZuvixCapability.Photos.rawValue,
    )

  private val coreCommands =
    setOf(
      ZuvixDeviceCommand.Status.rawValue,
      ZuvixDeviceCommand.Info.rawValue,
      ZuvixDeviceCommand.Permissions.rawValue,
      ZuvixDeviceCommand.Health.rawValue,
      ZuvixNotificationsCommand.List.rawValue,
      ZuvixNotificationsCommand.Actions.rawValue,
      ZuvixSystemCommand.Notify.rawValue,
      ZuvixTalkCommand.PttStart.rawValue,
      ZuvixTalkCommand.PttStop.rawValue,
      ZuvixTalkCommand.PttCancel.rawValue,
      ZuvixTalkCommand.PttOnce.rawValue,
      ZuvixContactsCommand.Search.rawValue,
      ZuvixContactsCommand.Add.rawValue,
      ZuvixCalendarCommand.Events.rawValue,
      ZuvixCalendarCommand.Add.rawValue,
    )

  private val optionalCommands =
    setOf(
      ZuvixCameraCommand.Snap.rawValue,
      ZuvixCameraCommand.Clip.rawValue,
      ZuvixCameraCommand.List.rawValue,
      ZuvixLocationCommand.Get.rawValue,
      ZuvixMotionCommand.Activity.rawValue,
      ZuvixMotionCommand.Pedometer.rawValue,
      ZuvixSmsCommand.Send.rawValue,
      ZuvixSmsCommand.Search.rawValue,
      ZuvixCallLogCommand.Search.rawValue,
      ZuvixPhotosCommand.Latest.rawValue,
    )

  private val debugCommands = setOf("debug.logs", "debug.ed25519")

  @Test
  fun advertisedCapabilities_respectsFeatureAvailability() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags())

    assertContainsAll(capabilities, coreCapabilities)
    assertMissingAll(capabilities, optionalCapabilities)
  }

  @Test
  fun advertisedCapabilities_includesFeatureCapabilitiesWhenEnabled() {
    val capabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          photosAvailable = true,
          voiceWakeEnabled = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
        ),
      )

    assertContainsAll(capabilities, coreCapabilities + optionalCapabilities)
  }

  @Test
  fun advertisedCommands_respectsFeatureAvailability() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags())

    assertContainsAll(commands, coreCommands)
    assertMissingAll(commands, optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_includesDeviceAppsOnlyWhenUserOptedIn() {
    val disabled = InvokeCommandRegistry.advertisedCommands(defaultFlags(installedAppsSharingEnabled = false))
    val enabled = InvokeCommandRegistry.advertisedCommands(defaultFlags(installedAppsSharingEnabled = true))

    assertFalse(disabled.contains(ZuvixDeviceCommand.Apps.rawValue))
    assertTrue(enabled.contains(ZuvixDeviceCommand.Apps.rawValue))
  }

  @Test
  fun advertisedCommands_includesFeatureCommandsWhenEnabled() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          photosAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          debugBuild = true,
        ),
      )

    assertContainsAll(commands, coreCommands + optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_onlyIncludesSupportedMotionCommands() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        NodeRuntimeFlags(
          cameraEnabled = false,
          locationEnabled = false,
          sendSmsAvailable = false,
          readSmsAvailable = false,
          smsSearchPossible = false,
          callLogAvailable = false,
          photosAvailable = false,
          voiceWakeEnabled = false,
          motionActivityAvailable = true,
          motionPedometerAvailable = false,
          installedAppsSharingEnabled = false,
          debugBuild = false,
        ),
      )

    assertTrue(commands.contains(ZuvixMotionCommand.Activity.rawValue))
    assertFalse(commands.contains(ZuvixMotionCommand.Pedometer.rawValue))
  }

  @Test
  fun advertisedCommands_splitsSmsSendAndSearchAvailability() {
    val readOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(readSmsAvailable = true, smsSearchPossible = true),
      )
    val sendOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCommands.contains(ZuvixSmsCommand.Search.rawValue))
    assertFalse(readOnlyCommands.contains(ZuvixSmsCommand.Send.rawValue))
    assertTrue(sendOnlyCommands.contains(ZuvixSmsCommand.Send.rawValue))
    assertFalse(sendOnlyCommands.contains(ZuvixSmsCommand.Search.rawValue))
    assertTrue(requestableSearchCommands.contains(ZuvixSmsCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_includeSmsWhenEitherSmsPathIsAvailable() {
    val readOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(readSmsAvailable = true),
      )
    val sendOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCapabilities.contains(ZuvixCapability.Sms.rawValue))
    assertTrue(sendOnlyCapabilities.contains(ZuvixCapability.Sms.rawValue))
    assertFalse(requestableSearchCapabilities.contains(ZuvixCapability.Sms.rawValue))
  }

  @Test
  fun advertisedCommands_excludesCallLogWhenUnavailable() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(callLogAvailable = false))

    assertFalse(commands.contains(ZuvixCallLogCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_excludesCallLogWhenUnavailable() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(callLogAvailable = false))

    assertFalse(capabilities.contains(ZuvixCapability.CallLog.rawValue))
  }

  @Test
  fun advertisedPhotosSurface_respectsFeatureAvailability() {
    val disabledFlags = defaultFlags(photosAvailable = false)
    val enabledFlags = defaultFlags(photosAvailable = true)

    assertFalse(InvokeCommandRegistry.advertisedCapabilities(disabledFlags).contains(ZuvixCapability.Photos.rawValue))
    assertFalse(InvokeCommandRegistry.advertisedCommands(disabledFlags).contains(ZuvixPhotosCommand.Latest.rawValue))
    assertTrue(InvokeCommandRegistry.advertisedCapabilities(enabledFlags).contains(ZuvixCapability.Photos.rawValue))
    assertTrue(InvokeCommandRegistry.advertisedCommands(enabledFlags).contains(ZuvixPhotosCommand.Latest.rawValue))
  }

  @Test
  fun advertisedCapabilities_includesVoiceWakeWithoutAdvertisingCommands() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(voiceWakeEnabled = true))
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(voiceWakeEnabled = true))

    assertTrue(capabilities.contains(ZuvixCapability.VoiceWake.rawValue))
    assertFalse(commands.any { it.contains("voice", ignoreCase = true) })
  }

  @Test
  fun find_returnsForegroundMetadataForCameraCommands() {
    val list = InvokeCommandRegistry.find(ZuvixCameraCommand.List.rawValue)
    val location = InvokeCommandRegistry.find(ZuvixLocationCommand.Get.rawValue)

    assertNotNull(list)
    assertEquals(true, list?.requiresForeground)
    assertNotNull(location)
    assertEquals(false, location?.requiresForeground)
  }

  @Test
  fun find_returnsNullForUnknownCommand() {
    assertNull(InvokeCommandRegistry.find("not.real"))
  }

  private fun defaultFlags(
    cameraEnabled: Boolean = false,
    locationEnabled: Boolean = false,
    sendSmsAvailable: Boolean = false,
    readSmsAvailable: Boolean = false,
    smsSearchPossible: Boolean = false,
    callLogAvailable: Boolean = false,
    photosAvailable: Boolean = false,
    voiceWakeEnabled: Boolean = false,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    installedAppsSharingEnabled: Boolean = false,
    debugBuild: Boolean = false,
  ): NodeRuntimeFlags =
    NodeRuntimeFlags(
      cameraEnabled = cameraEnabled,
      locationEnabled = locationEnabled,
      sendSmsAvailable = sendSmsAvailable,
      readSmsAvailable = readSmsAvailable,
      smsSearchPossible = smsSearchPossible,
      callLogAvailable = callLogAvailable,
      photosAvailable = photosAvailable,
      voiceWakeEnabled = voiceWakeEnabled,
      motionActivityAvailable = motionActivityAvailable,
      motionPedometerAvailable = motionPedometerAvailable,
      installedAppsSharingEnabled = installedAppsSharingEnabled,
      debugBuild = debugBuild,
    )

  private fun assertContainsAll(
    actual: List<String>,
    expected: Set<String>,
  ) {
    expected.forEach { value -> assertTrue(actual.contains(value)) }
  }

  private fun assertMissingAll(
    actual: List<String>,
    forbidden: Set<String>,
  ) {
    forbidden.forEach { value -> assertFalse(actual.contains(value)) }
  }
}
