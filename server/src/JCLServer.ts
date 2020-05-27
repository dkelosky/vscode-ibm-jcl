import { InitializeParams, TextDocuments, InitializeResult, createConnection, ProposedFeatures, Connection, DidChangeConfigurationNotification, DocumentSymbolParams, SymbolInformation, SymbolKind, TextDocumentChangeEvent, TextDocument, Diagnostic, DiagnosticSeverity, DidChangeConfigurationParams } from "vscode-languageserver";

export interface IJclSettings {
    maxNumberOfProblems: number;
}

export class JCLServer {

    public static readonly MAX_LEN = 80;

    public hasConfigurationCapability: boolean;
    public hasWorkspaceFolderCapability: boolean;
    public hasDiagnosticRelatedInformationCapability: boolean;

    public connection: Connection;
    public documents: TextDocuments;

    // The global settings, used when the `workspace/configuration` request is not supported by the client.
    // Please note that this is not the case when using this server with the client provided in this example
    // but could happen with other clients.
    private static readonly defaultSettings: IJclSettings = { maxNumberOfProblems: 1000 };
    private globalSettings: IJclSettings;

    // Cache the settings of all open documents
    private documentSettings: Map<string, Thenable<IJclSettings>>;

    constructor() {

        this.documentSettings = new Map();
        this.globalSettings = JCLServer.defaultSettings;

        // Create a simple text document manager. The text document manager
        // supports full document sync only
        this.documents = new TextDocuments();

        // Create a connection for the server. The connection uses Node's IPC as a transport.
        // Also include all preview / proposed LSP features.
        this.connection = createConnection(ProposedFeatures.all);

        // init values
        this.hasConfigurationCapability = false;
        this.hasWorkspaceFolderCapability = false;
        this.hasDiagnosticRelatedInformationCapability = false;

        // set listeners
        this.setConnectionListeners();

        // Make the text document manager listen on the connection
        // for open, change and close text document events
        this.documents.listen(this.connection);

        // listen on the connection
        this.connection.listen();
    }

    private initialize(params: InitializeParams): InitializeResult {

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

        return {
            capabilities: {
                textDocumentSync: this.documents.syncKind,
                documentSymbolProvider: true,
            }
        };
    }

    private initialized(): void {
        if (this.hasConfigurationCapability) {
            // Register for all configuration changes.
            this.connection.client.register(DidChangeConfigurationNotification.type, undefined);
        }
        if (this.hasWorkspaceFolderCapability) {
            this.connection.workspace.onDidChangeWorkspaceFolders((event) => {
                this.connection.console.log("Workspace folder change event received.");
            });
        }
    }

    private didChangeConfiguration(change: DidChangeConfigurationParams): void {
        if (this.hasConfigurationCapability) {
            // Reset all cached document settings
            this.documentSettings.clear();
        } else {
            this.globalSettings =
                (change.settings.languageServerExample || JCLServer.defaultSettings);
        }

        // Revalidate all open text documents
        this.documents.all().forEach(this.validateTextDocument.bind(this));
    }

    private documentSymbol(parm: DocumentSymbolParams): SymbolInformation[] | null {
        const symbols: SymbolInformation[] = [];
        const document = this.documents.get(parm.textDocument.uri);
        if (!document) {
            return null;
        }

        const lines = document.getText().split("\n");
        for (let i = 0; i < lines.length - 1; i++) {

            if (lines[i][0] === "/" && lines[i][1] === "/" && lines[i][2] !== "*" && lines[i][2] !== " ") {

                // compress multiple spaces to a single space
                let tokenizedLine = lines[i].replace(/\s+/g, " ").split(" ");

                // remove blank entries
                tokenizedLine = tokenizedLine.filter((entry) => entry !== "");

                if (tokenizedLine.length > 0) {

                    const entry: SymbolInformation = {
                        name: tokenizedLine[0],
                        kind: SymbolKind.Constant,
                        location: {
                            uri: parm.textDocument.uri,
                            range: {
                                start: { line: i, character: 0 },
                                end: { line: i, character: tokenizedLine[0].length - 1 }
                            }
                        }
                    };

                    symbols.push(entry);
                }

            }
        }
        return symbols;
    }

    private getDocumentSettings(resource: string): Thenable<IJclSettings> {
        if (!this.hasConfigurationCapability) {
            return Promise.resolve(this.globalSettings);
        }
        let result = this.documentSettings.get(resource);
        if (!result) {
            result = this.connection.workspace.getConfiguration({
                scopeUri: resource,
                section: "jclServer"
            });
            this.documentSettings.set(resource, result);
        }
        return result;
    }


    private documentsDidClose(change: TextDocumentChangeEvent) {
        // Only keep settings for open documents
        this.documentSettings.delete(change.document.uri);
    }

    // The content of a text document has changed. This event is emitted
    // when the text document first opened or when its content has changed.
    private documentsDidChangeContent(change: TextDocumentChangeEvent) {
        this.validateTextDocument(change.document);
    }

    private setDocumentsListeners(): void {
        this.documents.onDidClose(this.documentsDidClose.bind(this));
        this.documents.onDidChangeContent(this.documentsDidChangeContent.bind(this));
    }

    private setConnectionListeners(): void {
        this.connection.onInitialize(this.initialize.bind(this));
        this.connection.onInitialized(this.initialized.bind(this));
        this.connection.onDidChangeConfiguration(this.didChangeConfiguration.bind(this));
        this.connection.onDocumentSymbol(this.documentSymbol.bind(this));
    }


    private async validateTextDocument(textDocument: TextDocument): Promise<void> {
        // In this simple example we get the settings for every validate run.
        const settings = await this.getDocumentSettings(textDocument.uri);

        // The validator creates diagnostics for all uppercase words length 2 and more
        const text = textDocument.getText();

        let problems = 0;
        const diagnostics: Diagnostic[] = [];

        // TODO(Kelosky): account for max number of problems
        //   while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
        // TODO(Kelosky): print diagnostics for blank lines

        const lines = text.split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].length - 1 > JCLServer.MAX_LEN) {
                problems++;

                const diagnostic: Diagnostic = {
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: { line: i, character: JCLServer.MAX_LEN },
                        end: { line: i, character: lines[i].length - 1 },
                    },
                    message: `Exceeded ${JCLServer.MAX_LEN} characters`,
                    source: "jcl"
                };

                diagnostics.push(diagnostic);
            }

        }

        // Send the computed diagnostics to VSCode.
        this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    }


}
