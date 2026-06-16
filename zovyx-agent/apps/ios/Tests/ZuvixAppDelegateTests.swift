import Testing
@testable import Zuvix

@Suite(.serialized) struct ZuvixAppDelegateTests {
    @Test @MainActor func resolvesRegistryModelBeforeViewTaskAssignsDelegateModel() {
        let registryModel = NodeAppModel()
        ZuvixAppModelRegistry.appModel = registryModel
        defer { ZuvixAppModelRegistry.appModel = nil }

        let delegate = ZuvixAppDelegate()

        #expect(delegate._test_resolvedAppModel() === registryModel)
    }

    @Test @MainActor func prefersExplicitDelegateModelOverRegistryFallback() {
        let registryModel = NodeAppModel()
        let explicitModel = NodeAppModel()
        ZuvixAppModelRegistry.appModel = registryModel
        defer { ZuvixAppModelRegistry.appModel = nil }

        let delegate = ZuvixAppDelegate()
        delegate.appModel = explicitModel

        #expect(delegate._test_resolvedAppModel() === explicitModel)
    }
}
