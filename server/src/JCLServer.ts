import { InitializeParams, TextDocuments, InitializeResult, createConnection, ProposedFeatures, Connection, DidChangeConfigurationNotification, DocumentSymbolParams, SymbolInformation, TextDocumentChangeEvent, TextDocument, Diagnostic, DidChangeConfigurationParams } from "vscode-languageserver";
import { Capabilities } from "./Capabilities";
import { Settings } from "./Settings";
import { Symbols } from "./Symbols";
import { Diagnostics } from "./Diagnostics";

export class JCLServer {

    public connection: Connection;
    public documents: TextDocuments;

    private capabilities: Capabilities;
    private settings: Settings;

    constructor() {

        // capabilities
        this.capabilities = new Capabilities();

        // Create a simple text document manager. The text document manager
        // supports full document sync only
        this.documents = new TextDocuments();

        // Create a connection for the server. The connection uses Node's IPC as a transport.
        // Also include all preview / proposed LSP features.
        this.connection = createConnection(ProposedFeatures.all);

        // settings
        this.settings = new Settings(this.connection, this.capabilities);

        // set listeners
        this.setDocumentsListeners();
        this.setConnectionListeners();

        // Make the text document manager listen on the connection
        // for open, change and close text document events
        this.documents.listen(this.connection);

        // listen on the connection
        this.connection.listen();
    }

    private initialize(params: InitializeParams): InitializeResult {

        // set capabilities
        this.capabilities.init(params);

        return {
            capabilities: {
                textDocumentSync: this.documents.syncKind,
                documentSymbolProvider: true,
            }
        };
    }

    private initialized(): void {
        if (this.capabilities.hasConfigurationCapability) {
            // Register for all configuration changes.
            this.connection.client.register(DidChangeConfigurationNotification.type, undefined);
        }
        if (this.capabilities.hasWorkspaceFolderCapability) {
            this.connection.workspace.onDidChangeWorkspaceFolders((event) => {
                this.connection.console.error("Workspace folder change event received.");
            });
        }
    }

    private didChangeConfiguration(change: DidChangeConfigurationParams): void {
        if (this.capabilities.hasConfigurationCapability) {
            // Reset all cached document settings
            this.settings.documentSettings.clear();
        } else {
            this.settings.globalSettings =
                (change.settings.languageServerExample || Settings.defaultSettings);
        }

        // Revalidate all open text documents
        this.documents.all().forEach(this.validateTextDocument.bind(this));
    }

    private documentSymbol(parm: DocumentSymbolParams): SymbolInformation[] | null {
        const document = this.documents.get(parm.textDocument.uri);
       
        if (!document) {
            return null;
        }

        return Symbols.parse(document);
    }

    private documentsDidClose(change: TextDocumentChangeEvent): void {
        // Only keep settings for open documents
        this.settings.documentSettings.delete(change.document.uri);
    }

    // The content of a text document has changed. This event is emitted
    // when the text document first opened or when its content has changed.
    private documentsDidChangeContent(change: TextDocumentChangeEvent): void {
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
        const settings = await this.settings.getDocumentSettings(textDocument.uri);

        const diagnostics: Diagnostic[] = [];

        Diagnostics.checkLengths(textDocument, diagnostics, settings.maxNumberOfProblems);

        // Send the computed diagnostics to VSCode.
        this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });

    }

}
