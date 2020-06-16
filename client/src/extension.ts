/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from "path";
import { workspace, ExtensionContext, window, commands } from "vscode";
import TelemetryReporter  from "vscode-extension-telemetry";

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from "vscode-languageclient";

let client: LanguageClient;

// all events will be prefixed with this event name
const extensionId = 'ibm-jcl';

// extension version will be reported as a property with each event 
const extensionVersion = '0.11.0';

// the application insights key (also known as instrumentation key)
const key = '74997a52-f83f-42b1-bd75-586c155a8fc5';

// telemetry reporter 
let reporter: TelemetryReporter;

export function activate(context: ExtensionContext) {

    reporter = new TelemetryReporter(extensionId, extensionVersion, key);
    // ensure it gets property disposed
    context.subscriptions.push(reporter);

    const disposable = commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
        window.showInformationMessage('Hello World!');
        
        reporter.sendTelemetryEvent('sampleEvent', { 'stringProp': 'some string' }, { 'numericMeasure': 123 });
	});

    // The server is implemented in node
    const serverModule = context.asAbsolutePath(
        path.join("server", "out", "server.js")
    );
    // The debug options for the server
    // --inspect=6009: runs the server in Node"s Inspector mode so VS Code can attach to the server for debugging
    const debugOptions = { execArgv: ["--nolazy", "--inspect=6010"] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        },
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: "file", language: "jcl" }],
        synchronize: {
            // Notify the server about file changes to ".clientrc files contained in the workspace
            fileEvents: workspace.createFileSystemWatcher("**/.jcl")
        }
    };

    // Create the language client and start the client.
    client = new LanguageClient(
        "jclServer",
        "JCL Server",
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();

    // TODO(Kelosky): refine errors
    // context.subscriptions.push(
    //     languages.registerDocumentSemanticTokensProvider({ language: "jcl"}, new DocumentSemanticTokensProvider(), legend));
}

export function deactivate(): Thenable<void> | undefined {
    // This will ensure all pending events get flushed
    reporter.dispose();

    if (!client) {
        return undefined;
    }
    return client.stop();
}