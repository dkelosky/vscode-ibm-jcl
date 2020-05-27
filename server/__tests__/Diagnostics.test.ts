import { TextDocument } from "vscode-languageserver";
import { Diagnostics } from "../src/Diagnostics"

describe("Diagnostics tests", () => {

    it("should give back a diagnostic error for a line that is too long", () => {
        const eightyOneChars = "                                                                                 \r\n"
        const doc = TextDocument.create("/nowhere", "jcl", 1, eightyOneChars);
        const diagnostics = [];
        Diagnostics.checkLengths(doc, diagnostics, 1);
        expect(diagnostics).toMatchSnapshot();
    });


    it("should give back one diagnostic error for two lines that are too long if setting max is reached", () => {
        const eightyOneCharsTwice = "                                                                                 \r\n" +
                                    "                                                                                 \r\n";
        const doc = TextDocument.create("/nowhere", "jcl", 1, eightyOneCharsTwice);
        const diagnostics = [];
        Diagnostics.checkLengths(doc, diagnostics, 0);
        expect(diagnostics).toMatchSnapshot();
    });


    it("should not give back a diagnostic error for a line that is not too long", () => {
        const eightyChars = "                                                                                 \r\n"
        const doc = TextDocument.create("/nowhere", "jcl", 1, eightyChars);
        const diagnostics = [];
        Diagnostics.checkLengths(doc, diagnostics, 1);
        expect(diagnostics).toMatchSnapshot();
    });
});
