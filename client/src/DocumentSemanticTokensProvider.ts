import * as vscode from "vscode";

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

// This maps tokensLegend defaults to TextMate Grammers
// https://github.com/microsoft/vscode/blob/be0aca7188ec6a76e7c2379758c0fbc1e9c21f7b/src/vs/platform/theme/common/tokenClassificationRegistry.ts#L372-L408

export const legend = (() => {
    const tokenTypesLegend = [
        "comment", "string", "keyword", "number", "regexp", "operator", "namespace",
        "type", "struct", "class", "interface", "enum", "typeParameter", "function",
        "member", "macro", "variable", "parameter", "property", "label"
    ];
    tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

    // these need editor config to show
    const tokenModifiersLegend = [
        "declaration", "documentation", "readonly", "static", "abstract", "deprecated",
        "modification", "async"
    ];
    tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));

    return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(vscode.languages
        .registerDocumentSemanticTokensProvider({ language: "jcl" }, new DocumentSemanticTokensProvider(), legend));
}

interface IParsedToken {
    line: number;
    startCharacter: number;
    length: number;
    tokenType: string;
    tokenModifiers: string[];
}

export class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
    async provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken):
        Promise<vscode.SemanticTokens> {
        const allTokens = this._parseText(document.getText());
        const builder = new vscode.SemanticTokensBuilder();
        allTokens.forEach((token) => {
            builder.push(token.line, token.startCharacter, token.length,
                this._encodeTokenType(token.tokenType), this._encodeTokenModifiers(token.tokenModifiers));
        });
        return builder.build();
    }

    private _encodeTokenType(tokenType: string): number {
        if (tokenTypes.has(tokenType)) {
            return tokenTypes.get(tokenType)!;
        } else if (tokenType === "notInLegend") {
            return tokenTypes.size + 2;
        }
        return 0;
    }

    private _encodeTokenModifiers(strTokenModifiers: string[]): number {
        let result = 0;
        for (let i = 0; i < strTokenModifiers.length; i++) {
            const tokenModifier = strTokenModifiers[i];
            if (tokenModifiers.has(tokenModifier)) {
                result = result | (1 << tokenModifiers.get(tokenModifier)!);
            } else if (tokenModifier === "notInLegend") {
                result = result | (1 << tokenModifiers.size + 2);
            }
        }
        return result;
    }

    private _parseText(text: string): IParsedToken[] {
        let r: IParsedToken[] = [];
        let lines = text.split(/\r\n|\r|\n/);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let currentOffset = 0;
            let openOffset = -1;
            let closeOffset = -1;

            let tokens = line.replace(/\s+/g, " ").split(" ");
            tokens = tokens.filter((entry) => entry !== "");

            // where we have // s
            if (tokens.length > 1) {

                if (tokens[1].indexOf("IF") > -1) {
                    openOffset = line.indexOf(" IF");


                    if ()
                    }

            }

            for (let j = 0; j < tokens.length; j++) {

                console.log(`${tokens[j]}`)
            }

            if (openOffset === -1) {
                break;
            }
            // const openOffset = line.indexOf("[", currentOffset);
            // if (openOffset === -1) {
            //     break;
            // }
            // const closeOffset = line.indexOf("]", openOffset);
            // if (closeOffset === -1) {
            //     break;
            // }
            // let tokenData = this._parseTextToken(line.substring(openOffset + 1, closeOffset));
            r.push({
                line: i,
                startCharacter: openOffset + 1,
                length: closeOffset - openOffset - 1,
                tokenType: tokenData.tokenType,
                tokenModifiers: tokenData.tokenModifiers
            });
            // currentOffset = closeOffset;
            // } while (true);
        }
        return r;
    }


    private _parseTextToken(text: string): { tokenType: string; tokenModifiers: string[]; } {
        let parts = text.split(".");
        return {
            tokenType: parts[0],
            tokenModifiers: parts.slice(1)
        };
    }
}
