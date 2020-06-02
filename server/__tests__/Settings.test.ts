import { Settings, IJclSettings } from "../src/Settings"
import { Capabilities } from "../src/Capabilities"


describe("Settings tests", () => {

    it("should get default settings", async () => {

        const connection = {
            workspace: {
                getConfiguration: jest.fn(() => {
                    return new Promise<IJclSettings>((resolve) => {
                        resolve({
                            maxNumberOfProblems: 8
                        });
                    })
                })
            }
        }

        const capabilities = new Capabilities();

        const settings = new Settings(connection as any, capabilities);
        const result = await settings.getDocumentSettings("/hey")
        expect(result).toMatchSnapshot();
    });

    it("should get specific settings", async () => {

        const connection = {
            workspace: {
                getConfiguration: jest.fn(() => {
                    return new Promise<IJclSettings>((resolve) => {
                        resolve({
                            maxNumberOfProblems: 8
                        });
                    })
                })
            }
        }

        const capabilities = new Capabilities();
        capabilities.hasConfigurationCapability = true;

        const settings = new Settings(connection as any, capabilities);
        const result = await settings.getDocumentSettings("/hey")
        expect(result).toMatchSnapshot();
    });

});
