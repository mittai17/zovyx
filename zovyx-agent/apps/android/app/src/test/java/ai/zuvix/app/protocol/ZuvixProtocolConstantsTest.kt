package ai.zuvix.app.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class ZuvixProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", ZuvixCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", ZuvixCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", ZuvixCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", ZuvixCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", ZuvixCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", ZuvixCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", ZuvixCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", ZuvixCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", ZuvixCapability.Canvas.rawValue)
    assertEquals("camera", ZuvixCapability.Camera.rawValue)
    assertEquals("voiceWake", ZuvixCapability.VoiceWake.rawValue)
    assertEquals("talk", ZuvixCapability.Talk.rawValue)
    assertEquals("location", ZuvixCapability.Location.rawValue)
    assertEquals("sms", ZuvixCapability.Sms.rawValue)
    assertEquals("device", ZuvixCapability.Device.rawValue)
    assertEquals("notifications", ZuvixCapability.Notifications.rawValue)
    assertEquals("system", ZuvixCapability.System.rawValue)
    assertEquals("photos", ZuvixCapability.Photos.rawValue)
    assertEquals("contacts", ZuvixCapability.Contacts.rawValue)
    assertEquals("calendar", ZuvixCapability.Calendar.rawValue)
    assertEquals("motion", ZuvixCapability.Motion.rawValue)
    assertEquals("callLog", ZuvixCapability.CallLog.rawValue)
  }

  @Test
  fun cameraCommandsUseStableStrings() {
    assertEquals("camera.list", ZuvixCameraCommand.List.rawValue)
    assertEquals("camera.snap", ZuvixCameraCommand.Snap.rawValue)
    assertEquals("camera.clip", ZuvixCameraCommand.Clip.rawValue)
  }

  @Test
  fun notificationsCommandsUseStableStrings() {
    assertEquals("notifications.list", ZuvixNotificationsCommand.List.rawValue)
    assertEquals("notifications.actions", ZuvixNotificationsCommand.Actions.rawValue)
  }

  @Test
  fun deviceCommandsUseStableStrings() {
    assertEquals("device.status", ZuvixDeviceCommand.Status.rawValue)
    assertEquals("device.info", ZuvixDeviceCommand.Info.rawValue)
    assertEquals("device.permissions", ZuvixDeviceCommand.Permissions.rawValue)
    assertEquals("device.health", ZuvixDeviceCommand.Health.rawValue)
    assertEquals("device.apps", ZuvixDeviceCommand.Apps.rawValue)
  }

  @Test
  fun systemCommandsUseStableStrings() {
    assertEquals("system.notify", ZuvixSystemCommand.Notify.rawValue)
  }

  @Test
  fun photosCommandsUseStableStrings() {
    assertEquals("photos.latest", ZuvixPhotosCommand.Latest.rawValue)
  }

  @Test
  fun contactsCommandsUseStableStrings() {
    assertEquals("contacts.search", ZuvixContactsCommand.Search.rawValue)
    assertEquals("contacts.add", ZuvixContactsCommand.Add.rawValue)
  }

  @Test
  fun calendarCommandsUseStableStrings() {
    assertEquals("calendar.events", ZuvixCalendarCommand.Events.rawValue)
    assertEquals("calendar.add", ZuvixCalendarCommand.Add.rawValue)
  }

  @Test
  fun motionCommandsUseStableStrings() {
    assertEquals("motion.activity", ZuvixMotionCommand.Activity.rawValue)
    assertEquals("motion.pedometer", ZuvixMotionCommand.Pedometer.rawValue)
  }

  @Test
  fun smsCommandsUseStableStrings() {
    assertEquals("sms.send", ZuvixSmsCommand.Send.rawValue)
    assertEquals("sms.search", ZuvixSmsCommand.Search.rawValue)
  }

  @Test
  fun talkCommandsUseStableStrings() {
    assertEquals("talk.ptt.start", ZuvixTalkCommand.PttStart.rawValue)
    assertEquals("talk.ptt.stop", ZuvixTalkCommand.PttStop.rawValue)
    assertEquals("talk.ptt.cancel", ZuvixTalkCommand.PttCancel.rawValue)
    assertEquals("talk.ptt.once", ZuvixTalkCommand.PttOnce.rawValue)
  }

  @Test
  fun callLogCommandsUseStableStrings() {
    assertEquals("callLog.search", ZuvixCallLogCommand.Search.rawValue)
  }
}
