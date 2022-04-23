"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebauthnHardwareAuthenticate = void 0;
const ethers_1 = require("ethers");
const fido2_lib_1 = require("fido2-lib");
const parser_1 = require("fido2-lib/lib/parser");
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
            cryptoParams: options.cryptoParams || [-7, -8, -47, -257],
            authenticatorRequireResidentKey: options.authenticatorRequireResidentKey || false,
            authenticatorUserVerification: options.authenticatorUserVerification || 'required',
        });
    }
    async registrationOptions(isMobile, username, payload) {
        const registrationOptions = await this.fido2.attestationOptions();
        const req = {
            challenge: undefined,
            userHandle: undefined,
        };
        req.challenge = payload;
        registrationOptions.user.id = username;
        registrationOptions.challenge = payload;
        if (isMobile)
            registrationOptions.authenticatorSelection = {
                authenticatorAttachment: 'platform',
            };
        return {
            ...req,
            ...registrationOptions,
        };
    }
    async signData(origin, updatedCreds, challenge, payload, uid, emitPublicKey) {
        const attestationExpectations = {
            challenge,
            origin,
            factor: 'either',
        };
        try {
            const attestationResult = await this.fido2.attestationResult(updatedCreds, attestationExpectations);
            const { authnrData, clientData, audit } = attestationResult;
            const publicKey = authnrData.get('credentialPublicKeyCose');
            const publicKeyJwk = authnrData.get('credentialPublicKeyJwk');
            const prevCounter = authnrData.get('counter');
            if (!!emitPublicKey)
                await emitPublicKey({
                    publicKey: new Uint8Array(publicKey),
                    publicKeyJwk,
                    prevCounter,
                    authnrData,
                    clientData,
                });
            const assertionOptions = await this.fido2.assertionOptions();
            assertionOptions.challenge = ethers_1.ethers.utils.arrayify(ethers_1.ethers.utils.sha256(payload)).buffer;
            assertionOptions.allowCredentials = [
                {
                    id: updatedCreds.rawId,
                    type: 'public-key',
                },
            ];
            const clientAssertion = await navigator.credentials.get({
                publicKey: assertionOptions,
            });
            const clientDataJSON = (0, parser_1.parseClientResponse)(clientAssertion);
            const authenticatorData = (0, parser_1.parseAuthenticatorData)(clientAssertion.response.authenticatorData);
            return {
                clientDataJSON,
                authenticatorData,
                signature: bufferToBase64(clientAssertion.response.signature),
                audit,
                raw: clientAssertion,
            };
        }
        catch (e) {
            throw e;
        }
    }
}
exports.WebauthnHardwareAuthenticate = WebauthnHardwareAuthenticate;
//# sourceMappingURL=webauthnServer.js.map