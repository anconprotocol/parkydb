"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebauthnHardwareClient = void 0;
const base64url_1 = __importDefault(require("base64url"));
const bufferToBase64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const base64ToBuffer = (base64) => Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
class WebauthnHardwareClient {
    constructor(server) {
        this.server = server;
    }
    async register(origin, username, displayName) {
        try {
            const credentialCreationOptions = await this.server.registrationOptions();
            const challenge = credentialCreationOptions.challenge;
            credentialCreationOptions.challenge = new Uint8Array(credentialCreationOptions.challenge);
            credentialCreationOptions.user.id = new Uint8Array(credentialCreationOptions.user.id);
            credentialCreationOptions.user.name = username;
            credentialCreationOptions.user.displayName = displayName;
            const credential = await navigator.credentials.create({
                publicKey: credentialCreationOptions,
            });
            const credentialId = base64url_1.default.encode(credential.rawId);
            const data = {
                rawId: credentialId,
                response: {
                    attestationObject: base64url_1.default.encode(credential.response.attestationObject),
                    clientDataJSON: base64url_1.default.encode(credential.response.clientDataJSON),
                    id: credential.id,
                    type: credential.type,
                },
            };
            const registerResponse = await this.server.register(origin, {
                credential: data,
                challenge,
            });
            return { registerResponse, credential: data };
        }
        catch (e) {
            alert(e.message);
            console.error(e);
        }
    }
    async verify(origin, registerResponse, userCredential) {
        try {
            const credentialRequestOptions = await this.server.verifyOptions();
            credentialRequestOptions.challenge = new Uint8Array(credentialRequestOptions.challenge.data);
            credentialRequestOptions.allowCredentials = [
                {
                    id: base64ToBuffer(userCredential.rawId),
                    type: 'public-key',
                    transports: ['internal'],
                },
            ];
            const credential = await navigator.credentials.get({
                publicKey: credentialRequestOptions,
            });
            const data = {
                rawId: bufferToBase64(credential.rawId),
                response: {
                    authenticatorData: bufferToBase64(credential.response.authenticatorData),
                    signature: bufferToBase64(credential.response.signature),
                    userHandle: bufferToBase64(credential.response.userHandle),
                    clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
                    id: credential.id,
                    type: credential.type,
                },
            };
            return this.server.verify(origin, {
                credential: data,
                prevCounter: registerResponse.prevCounter,
                publicKey: registerResponse.publicKey,
                userHandle: credential.response.userHandle,
                challenge: credentialRequestOptions.challenge,
            });
        }
        catch (e) {
            console.error('authentication failed', e);
        }
        finally {
        }
    }
}
exports.WebauthnHardwareClient = WebauthnHardwareClient;
//# sourceMappingURL=webauthnClient.js.map