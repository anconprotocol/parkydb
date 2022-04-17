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
            cryptoParams: [-7, -257],
            authenticatorRequireResidentKey: options.authenticatorRequireResidentKey || false,
            authenticatorUserVerification: options.authenticatorUserVerification || 'required',
        });
    }
    async registrationOptions() {
        const registrationOptions = await this.fido2.attestationOptions();
        const req = {
            challenge: undefined,
            userHandle: undefined,
        };
        req.challenge = Buffer.from(registrationOptions.challenge);
        req.userHandle = ethers_1.ethers.utils.randomBytes(32);
        registrationOptions.user.id = req.userHandle;
        registrationOptions.challenge = Buffer.from(registrationOptions.challenge);
        return {
            ...registrationOptions,
            ...req,
        };
    }
    async register(origin, request) {
        const { credential } = request;
        const challenge = new Uint8Array(request.challenge.data).buffer;
        credential.rawId = new Uint8Array(Buffer.from(credential.rawId, 'base64')).buffer;
        credential.response.attestationObject = base64url.decode(credential.response.attestationObject, 'base64');
        credential.response.clientDataJSON = base64url.decode(credential.response.clientDataJSON, 'base64');
        const attestationExpectations = {
            challenge,
            origin,
            factor: 'either',
        };
        try {
            const regResult = await this.fido2.attestationResult(credential, attestationExpectations);
            request.publicKey = regResult.authnrData.get('credentialPublicKeyPem');
            request.prevCounter = regResult.authnrData.get('counter');
            return request;
        }
        catch (e) {
            throw e;
        }
    }
    async verifyOptions() {
        const authnOptions = await this.fido2.assertionOptions();
        authnOptions.challenge = Buffer.from(authnOptions.challenge);
        return authnOptions;
    }
    async verify(origin, verifyReq) {
        const { credential } = verifyReq;
        credential.rawId = new Uint8Array(Buffer.from(credential.rawId, 'base64')).buffer;
        const challenge = new Uint8Array(verifyReq.challenge.data).buffer;
        const { publicKey, prevCounter } = verifyReq;
        if (publicKey === 'undefined' || prevCounter === undefined) {
            return false;
        }
        else {
            const assertionExpectations = {
                challenge,
                origin,
                factor: 'either',
                publicKey,
                prevCounter,
                userHandle: new Uint8Array(Buffer.from(verifyReq.userHandle, 'base64'))
                    .buffer,
            };
            try {
                await this.fido2.assertionResult(credential, assertionExpectations);
                return true;
            }
            catch (e) {
                console.log('error', e);
                return false;
            }
        }
    }
}
exports.WebauthnHardwareAuthenticate = WebauthnHardwareAuthenticate;
//# sourceMappingURL=webauthnServer.js.map