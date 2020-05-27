import { Capabilities } from "../src/Capabilities";
import { InitializeParams } from "vscode-languageserver";

describe("Capabilities tests", () => {

    it("should not have any capabilities", () => {
        const params: InitializeParams = {
            processId: 7, rootUri: "/nowhere", 
            capabilities: {
                textDocument: {

                },
                workspace: {
                    workspaceFolders: false
                }
            },
            workspaceFolders: []
        };
        const capabilities = new Capabilities();
        capabilities.init(params)
        expect(capabilities.hasConfigurationCapability).toBe(false);
        expect(capabilities.hasDiagnosticRelatedInformationCapability).toBe(false);
        expect(capabilities.hasWorkspaceFolderCapability).toBe(false);
    });

    it("should have all capabilities", () => {
        const params: InitializeParams = {
            processId: 7, rootUri: "/nowhere", 
            capabilities: {
                textDocument: {
                    publishDiagnostics: {
                        relatedInformation: true
                    }
                },
                workspace: {
                    workspaceFolders: true,
                    configuration: true
                }
            },
            workspaceFolders: []
        };
        const capabilities = new Capabilities();
        capabilities.init(params)
        expect(capabilities.hasConfigurationCapability).toBe(true);
        expect(capabilities.hasDiagnosticRelatedInformationCapability).toBe(true);
        expect(capabilities.hasWorkspaceFolderCapability).toBe(true);
    })

});
