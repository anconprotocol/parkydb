"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebauthnHardwareClient = void 0;
const base64url_1 = __importDefault(require("base64url"));
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
class WebauthnHardwareClient {
    constructor(server, db) {
        this.server = server;
        this.db = db;
    }
    async registerSign(origin, username, displayName, payload, emitPublicKey) {
        try {
            const credentialCreationOptions = await this.server.registrationOptions(username, payload);
            const challenge = credentialCreationOptions.challenge;
            credentialCreationOptions.challenge = new Uint8Array(credentialCreationOptions.challenge);
            credentialCreationOptions.user.id = new Uint8Array(credentialCreationOptions.user.id);
            credentialCreationOptions.user.name = username;
            credentialCreationOptions.user.displayName = displayName;
            let credential;
            const creds = await this.db.db.fido2keys.get({ id: 1 });
            if (!!creds) {
                credential = {
                    rawId: creds.rawId,
                    response: {
                        ...creds.credential.response,
                    },
                };
            }
            else {
                credential = await navigator.credentials.create({
                    publicKey: credentialCreationOptions,
                });
                const updatedCreds = { ...credential, response: {} };
                updatedCreds.rawId = new Uint8Array(Buffer.from(credential.rawId, 'base64')).buffer;
                updatedCreds.response.attestationObject = base64url_1.default.encode(credential.response.attestationObject);
                updatedCreds.response.clientDataJSON = base64url_1.default.encode(credential.response.clientDataJSON);
                await this.db.db.fido2keys.put({
                    id: 1,
                    credential: {
                        ...updatedCreds,
                    },
                    rawId: credential.rawId,
                }, 1);
                credential = updatedCreds;
            }
            const registerResponse = await this.server.signData(origin, credential, challenge, utils_1.arrayify(ethers_1.ethers.utils.sha256(payload)), credentialCreationOptions.user.id, emitPublicKey);
            return { ...registerResponse };
        }
        catch (e) {
            alert(e.message);
            console.error(e);
        }
    }
}
exports.WebauthnHardwareClient = WebauthnHardwareClient;
//# sourceMappingURL=webauthnClient.js.map