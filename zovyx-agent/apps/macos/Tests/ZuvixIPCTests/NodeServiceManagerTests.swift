import Foundation
import Testing
@testable import Zuvix

@Suite(.serialized) struct NodeServiceManagerTests {
    @Test func `builds node service commands with current CLI shape`() async throws {
        try await TestIsolation.withUserDefaultsValues(["zuvix.gatewayProjectRootPath": nil]) {
            let tmp = try makeTempDirForTests()
            CommandResolver.setProjectRoot(tmp.path)

            let zuvixPath = tmp.appendingPathComponent("node_modules/.bin/zuvix")
            try makeExecutableForTests(at: zuvixPath)

            let start = NodeServiceManager._testServiceCommand(["start"])
            #expect(start == [zuvixPath.path, "node", "start", "--json"])

            let stop = NodeServiceManager._testServiceCommand(["stop"])
            #expect(stop == [zuvixPath.path, "node", "stop", "--json"])
        }
    }
}
