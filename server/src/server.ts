/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    SymbolKind,
    SymbolInformation,
    TextDocument,
    Diagnostic,
    DiagnosticSeverity
} from "vscode-languageserver";

const MAX_LEN = 80;

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
const documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we will fall back using global settings
    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            documentSymbolProvider: true,
        }
    };
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders((event) => {
            connection.console.log("Workspace folder change event received.");
        });
    }
});

// The example settings
interface IJclSettings {
    maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: IJclSettings = { maxNumberOfProblems: 1000 };
let globalSettings: IJclSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<IJclSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    } else {
        globalSettings =
            (change.settings.languageServerExample || defaultSettings);
    }

    // Revalidate all open text documents
    documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<IJclSettings> {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: "jclServer"
        });
        documentSettings.set(resource, result);
    }
    return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
    // In this simple example we get the settings for every validate run.
    const settings = await getDocumentSettings(textDocument.uri);

    // The validator creates diagnostics for all uppercase words length 2 and more
    const text = textDocument.getText();

    let problems = 0;
    const diagnostics: Diagnostic[] = [];

    // TODO(Kelosky): account for max number of problems
    //   while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
    // TODO(Kelosky): print diagnostics for blank lines

    const lines = text.split("\n");
    for (let i = 0; i < lines.length - 1; i++) {
        if (lines[i].length - 1 > MAX_LEN) {
            problems++;

            const diagnostic: Diagnostic = {
                severity: DiagnosticSeverity.Error,
                range: {
                    start: { line: i, character: MAX_LEN },
                    end: { line: i, character: lines[i].length - 1 },
                },
                message: `Exceeded ${MAX_LEN} characters`,
                source: "jcl"
            };
            // if (hasDiagnosticRelatedInformationCapability) {
            //     diagnostic.relatedInformation = [
            //         {
            //             location: {
            //                 uri: textDocument.uri,
            //                 range: Object.assign({}, diagnostic.range)
            //             },
            //             message: 'Spelling matters'
            //         },
            //         {
            //             location: {
            //                 uri: textDocument.uri,
            //                 range: Object.assign({}, diagnostic.range)
            //             },
            //             message: 'Particularly for names'
            //         }
            //     ];
            // }
            diagnostics.push(diagnostic);
        }

        // const tokenizedLine = lines[i].replace(/\s+/g, " ").split(" ");

        // if (tokenizedLine.length > 0) {

        //     let kind: SymbolKind = SymbolKind.Constant;

        //     // TODO(Kelosky): if LABEL MVC -> this fails to capture
        //     if (tokenizedLine[0]) {
        //         if (tokenizedLine[0] === "MVC") {
        //             kind = SymbolKind.Object;
        //         }

        //         if (!tokenizedLine[1]) {
        //             // error missing arguments
        //             const start = lines[i].indexOf(tokenizedLine[0]);
        //             const diagnostic: Diagnostic = {
        //                 severity: DiagnosticSeverity.Error,
        //                 range: {
        //                     start: { line: i, character: start },
        //                     end: { line: i, character: start + tokenizedLine[0].length },
        //                 },
        //                 message: `Argument(s) missing for ${tokenizedLine[0]}`,
        //                 source: "hlasm"
        //             };
        //         }
        //     }
        // }

    }

    // Send the computed diagnostics to VSCode.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDocumentSymbol((parm) => {

    const symbols: SymbolInformation[] = [];
    const document = documents.get(parm.textDocument.uri);
    if (!document) {
        return null;
    }

    const lines = document.getText().split("\n");
    for (let i = 0; i < lines.length - 1; i++) {

        // if space or * in column one, it's not a symbol
        if (lines[i][0] === "/" && lines[i][1] === "/" && lines[i][2] !== "*" && lines[i][2] !== " ") {

            // compress multiple spaces to a single space
            let  tokenizedLine = lines[i].replace(/\s+/g, " ").split(" ");

            // remove blank entries
            tokenizedLine = tokenizedLine.filter((entry) => entry !== "");

            if (tokenizedLine.length > 0) {

                let kind: SymbolKind = SymbolKind.Constant;

                if (tokenizedLine[1]) {
                    if (tokenizedLine[1] === "DSECT") {
                        kind = SymbolKind.Object;
                    }
                }

                const entry: SymbolInformation = {
                    name: tokenizedLine[0],
                    kind,
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
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
