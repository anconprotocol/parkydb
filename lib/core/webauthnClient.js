"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebauthnHardwareClient = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
class WebauthnHardwareClient {
    constructor(server) {
        this.server = server;
    }
    async register(origin, username, displayName, payload) {
        try {
            const credentialCreationOptions = await this.server.registrationOptions(username, payload);
            const challenge = credentialCreationOptions.challenge;
            credentialCreationOptions.challenge = new Uint8Array(credentialCreationOptions.challenge);
            credentialCreationOptions.user.id = new Uint8Array(credentialCreationOptions.user.id);
            credentialCreationOptions.user.name = username;
            credentialCreationOptions.user.displayName = displayName;
            const credential = await navigator.credentials.create({
                publicKey: credentialCreationOptions,
            });
            const registerResponse = await this.server.signData(origin, credential, challenge, utils_1.arrayify(ethers_1.ethers.utils.sha256(payload)), credentialCreationOptions.user.id);
            return { ...registerResponse, };
        }
        catch (e) {
            alert(e.message);
            console.error(e);
        }
    }
}
exports.WebauthnHardwareClient = WebauthnHardwareClient;
//# sourceMappingURL=webauthnClient.js.map