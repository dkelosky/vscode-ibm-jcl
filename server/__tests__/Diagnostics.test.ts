import { Diagnostic, TextDocument } from "vscode-languageserver";
import { Diagnostics } from "../src/Diagnostics";

describe("Diagnostics tests", () => {

    it("should give back a diagnostic error for a line that is too long", () => {
        const eightyOneChars = "                                                                                 \r\n";
        const doc = TextDocument.create("/nowhere", "jcl", 1, eightyOneChars);
        const diagnostics: Diagnostic[] = [];
        Diagnostics.checkLengths(doc, diagnostics);
        expect(diagnostics).toMatchSnapshot();
    });


    it("should not give back a diagnostic error for a line that is not too long", () => {
        const eightyChars = "                                                                                 \r\n";
        const doc = TextDocument.create("/nowhere", "jcl", 1, eightyChars);
        const diagnostics: Diagnostic[] = [];
        Diagnostics.checkLengths(doc, diagnostics);
        expect(diagnostics).toMatchSnapshot();
    });
});
