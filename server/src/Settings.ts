import { Connection } from "vscode-languageserver";
import { Capabilities } from "./Capabilities";

export interface IJclSettings {
    maxNumberOfProblems: number;
}

export class Settings {

    // The global settings, used when the `workspace/configuration` request is not supported by the client.
    // Please note that this is not the case when using this server with the client provided in this example
    // but could happen with other clients.
    public static readonly defaultSettings: IJclSettings = { maxNumberOfProblems: 1000 };
    public globalSettings: IJclSettings;

    // Cache the settings of all open documents
    public documentSettings: Map<string, Thenable<IJclSettings>>;

    constructor(private connection: Connection, private capabilities: Capabilities) {
        this.documentSettings = new Map();
        this.globalSettings = Settings.defaultSettings;
    }

    public getDocumentSettings(resource: string): Thenable<IJclSettings> {
        if (!this.capabilities.hasConfigurationCapability) {
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
}