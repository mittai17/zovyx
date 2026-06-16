import Darwin
import Foundation
import Testing
@testable import Zuvix

struct LogLocatorTests {
    @Test func `launchd gateway log path ensures tmp dir exists`() {
        let fm = FileManager()
        let baseDir = URL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true)
        let logDir = baseDir.appendingPathComponent("zuvix-tests-\(UUID().uuidString)")

        setenv("ZUVIX_LOG_DIR", logDir.path, 1)
        defer {
            unsetenv("ZUVIX_LOG_DIR")
            try? fm.removeItem(at: logDir)
        }

        _ = LogLocator.launchdGatewayLogPath

        var isDir: ObjCBool = false
        #expect(fm.fileExists(atPath: logDir.path, isDirectory: &isDir))
        #expect(isDir.boolValue == true)
    }
}
