import { TextDocument, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

export class Diagnostics {
    public static readonly MAX_LEN = 80;

    public static checkLengths(document: TextDocument, diagnostics: Diagnostic[], maxProblems: number): void {

        const text = document.getText();
        let problems = diagnostics.length;

        const lines = text.split(/\r?\n/);
        for (let i = 0; i < lines.length - 1; i++) {

            if (problems > maxProblems) {
                break;
            }

            if (lines[i].length  > Diagnostics.MAX_LEN) {
                problems++;

                const diagnostic: Diagnostic = {
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: { line: i, character: Diagnostics.MAX_LEN },
                        end: { line: i, character: lines[i].length - 1 },
                    },
                    message: `Exceeded ${Diagnostics.MAX_LEN} characters`,
                    source: "jcl"
                };

                diagnostics.push(diagnostic);
            }

        }
    }
}
