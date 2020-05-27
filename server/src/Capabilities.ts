import { InitializeParams } from "vscode-languageserver";

export class Capabilities {
    
    public hasConfigurationCapability: boolean;
    public hasWorkspaceFolderCapability: boolean;
    public hasDiagnosticRelatedInformationCapability: boolean;

    constructor() {
        this.hasConfigurationCapability = false;
        this.hasWorkspaceFolderCapability = false;
        this.hasDiagnosticRelatedInformationCapability = false;
    }

    public init(params: InitializeParams): void {
        const capabilities = params.capabilities;

        // Does the client support the `workspace/configuration` request?
        // If not, we will fall back using global settings
        this.hasConfigurationCapability = !!(
            capabilities.workspace && !!capabilities.workspace.configuration
        );
        this.hasWorkspaceFolderCapability = !!(
            capabilities.workspace && !!capabilities.workspace.workspaceFolders
        );
        this.hasDiagnosticRelatedInformationCapability = !!(
            capabilities.textDocument &&
            capabilities.textDocument.publishDiagnostics &&
            capabilities.textDocument.publishDiagnostics.relatedInformation
        );
    }
}
