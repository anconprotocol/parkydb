"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebauthnHardwareAuthenticate = void 0;
const ethers_1 = require("ethers");
const fido2_lib_1 = require("fido2-lib");
const base64url = require('base64url');
const bufferToBase64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const base64ToBuffer = (base64) => Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
class WebauthnHardwareAuthenticate {
    constructor() { }
    initialize(options) {
        this.fido2 = new fido2_lib_1.Fido2Lib({
            timeout: 60000,
            rpId: options.rpId || 'localhost',
            rpName: options.rpName || 'localhost',
            rpIcon: options.rpIcon || '',
            challengeSize: 128,
            attestation: options.attestation || 'none',
            cryptoParams: [-47, -257],
            authenticatorRequireResidentKey: options.authenticatorRequireResidentKey || false,
            authenticatorUserVerification: options.authenticatorUserVerification || 'required',
        });
    }
    async registrationOptions(username, payload) {
        const registrationOptions = await this.fido2.attestationOptions();
        const req = {
            challenge: undefined,
            userHandle: undefined,
        };
        req.challenge = payload;
        registrationOptions.user.id = username;
        registrationOptions.challenge = payload;
        return {
            ...req,
            ...registrationOptions,
        };
    }
    async signData(origin, credential, challenge, payload, uid) {
        const updatedCreds = { ...credential, response: {} };
        updatedCreds.rawId = new Uint8Array(Buffer.from(credential.rawId, 'base64')).buffer;
        updatedCreds.response.attestationObject = base64url.encode(credential.response.attestationObject);
        updatedCreds.response.clientDataJSON = base64url.encode(credential.response.clientDataJSON);
        const attestationExpectations = {
            challenge,
            origin,
            factor: 'either',
        };
        try {
            const attestationResult = await this.fido2.attestationResult(updatedCreds, attestationExpectations);
            const { authnrData, clientData, audit } = attestationResult;
            const publicKey = authnrData.get('credentialPublicKeyPem');
            const prevCounter = authnrData.get('counter');
            const assertionOptions = await this.fido2.assertionOptions();
            assertionOptions.challenge = ethers_1.ethers.utils.arrayify(ethers_1.ethers.utils.sha256(payload)).buffer;
            assertionOptions.allowCredentials = [
                {
                    id: new Uint8Array(credential.rawId).buffer,
                    type: 'public-key',
                },
            ];
            const clientAssertion = await navigator.credentials.get({
                publicKey: assertionOptions,
            });
            return {
                authnrData,
                clientData,
                clientDataJSON: (bufferToBase64(clientAssertion.response.clientDataJSON)),
                authenticatorData: (bufferToBase64(clientAssertion.response.authenticatorDatN)),
                signature: (bufferToBase64(clientAssertion.response.signature)),
                audit,
            };
        }
        catch (e) {
            throw e;
        }
    }
}
exports.WebauthnHardwareAuthenticate = WebauthnHardwareAuthenticate;
//# sourceMappingURL=webauthnServer.js.map