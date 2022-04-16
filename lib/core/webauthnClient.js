"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebauthnHardwareClient = void 0;
const utils_1 = require("ethers/lib/utils");
class WebauthnHardwareClient {
    constructor(server) {
        this.server = server;
    }
    async register(origin, username, displayName) {
        try {
            const credentialCreationOptions = await this.server.registrationOptions();
            credentialCreationOptions.challenge = new Uint8Array(credentialCreationOptions.challenge.data);
            credentialCreationOptions.user.id = new Uint8Array(credentialCreationOptions.user.id.data);
            credentialCreationOptions.user.name = username;
            credentialCreationOptions.user.displayName = displayName;
            const credential = await navigator.credentials.create({
                publicKey: credentialCreationOptions,
            });
            const credentialId = utils_1.base64.encode(credential.rawId);
            const data = {
                rawId: credentialId,
                response: {
                    attestationObject: utils_1.base64.encode(credential.response.attestationObject),
                    clientDataJSON: utils_1.base64.encode(credential.response.clientDataJSON),
                    id: credential.id,
                    type: credential.type,
                },
            };
            const registerResponse = await this.server.register(origin, { credential: data });
            return { registerResponse, credential: data };
        }
        catch (e) { }
    }
    async verify(origin, registerResponse, userCredential) {
        try {
            const credentialRequestOptions = await this.server.verifyOptions();
            credentialRequestOptions.challenge = new Uint8Array(credentialRequestOptions.challenge.data);
            credentialRequestOptions.allowCredentials = [
                {
                    id: utils_1.base64.encode(userCredential.rawId),
                    type: 'public-key',
                    transports: ['internal'],
                },
            ];
            const credential = await navigator.credentials.get({
                publicKey: credentialRequestOptions,
            });
            const data = {
                rawId: utils_1.base64.encode(credential.rawId),
                response: {
                    authenticatorData: utils_1.base64.encode(credential.response.authenticatorData),
                    signature: utils_1.base64.encode(credential.response.signature),
                    userHandle: utils_1.base64.encode(credential.response.userHandle),
                    clientDataJSON: utils_1.base64.encode(credential.response.clientDataJSON),
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