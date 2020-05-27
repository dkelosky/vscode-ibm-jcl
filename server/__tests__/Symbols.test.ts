import { Symbols } from "../src/Symbols"
import { TextDocument } from "vscode-languageserver";

describe("Symbols tests", () => {

    it("should have one symbol", () => {
        const file = "//HELLO\r\n";
        const document = TextDocument.create("/nowhere", "jcl", 1, file);
        expect(Symbols.parse(document)).toMatchSnapshot();
    });


    it("should have no symbols", () => {
        const file = " //HELLO\r\n";
        const document = TextDocument.create("/nowhere", "jcl", 1, file);
        expect(Symbols.parse(document)).toMatchSnapshot();
    });
});
