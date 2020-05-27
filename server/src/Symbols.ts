import { SymbolInformation, TextDocument, SymbolKind } from "vscode-languageserver";

export class Symbols {

    public static parse(document: TextDocument): SymbolInformation[] {
        const symbols: SymbolInformation[] = [];
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
                            uri: document.uri,
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
}