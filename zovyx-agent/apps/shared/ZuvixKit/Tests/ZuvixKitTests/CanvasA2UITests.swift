import ZuvixKit
import Testing

@Suite struct CanvasA2UITests {
    @Test func commandStringsAreStable() {
        #expect(ZuvixCanvasA2UICommand.push.rawValue == "canvas.a2ui.push")
        #expect(ZuvixCanvasA2UICommand.pushJSONL.rawValue == "canvas.a2ui.pushJSONL")
        #expect(ZuvixCanvasA2UICommand.reset.rawValue == "canvas.a2ui.reset")
    }

    @Test func jsonlDecodesAndValidatesV0_8() throws {
        let jsonl = """
        {"beginRendering":{"surfaceId":"main","timestamp":1}}
        {"surfaceUpdate":{"surfaceId":"main","ops":[]}}
        {"dataModelUpdate":{"dataModel":{"title":"Hello"}}}
        {"deleteSurface":{"surfaceId":"main"}}
        """

        let messages = try ZuvixCanvasA2UIJSONL.decodeMessagesFromJSONL(jsonl)
        #expect(messages.count == 4)
    }

    @Test func jsonlRejectsV0_9CreateSurface() {
        let jsonl = """
        {"createSurface":{"surfaceId":"main"}}
        """

        #expect(throws: Error.self) {
            _ = try ZuvixCanvasA2UIJSONL.decodeMessagesFromJSONL(jsonl)
        }
    }

    @Test func jsonlRejectsUnknownShape() {
        let jsonl = """
        {"wat":{"nope":1}}
        """

        #expect(throws: Error.self) {
            _ = try ZuvixCanvasA2UIJSONL.decodeMessagesFromJSONL(jsonl)
        }
    }
}
