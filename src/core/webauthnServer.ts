// @ts-ignore

import { ethers } from 'ethers'
// @ts-ignore
import { Fido2Lib } from 'fido2-lib'
import { window } from 'rxjs'

const base64url = require('base64url')

// @ts-ignore
const bufferToBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
// @ts-ignore
const base64ToBuffer = (base64) =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
export class WebauthnHardwareAuthenticate {
  private fido2: any
  constructor() {}

  initialize(options: {
    rpId: any
    rpName: any
    rpIcon: any
    attestation?: any
    authenticatorRequireResidentKey?: any
    authenticatorUserVerification?: any
  }) {
    this.fido2 = new Fido2Lib({
      timeout: 60000,
      rpId: options.rpId || 'localhost',
      rpName: options.rpName || 'localhost',
      rpIcon: options.rpIcon || '',
      challengeSize: 128,
      attestation: options.attestation || 'none',
      cryptoParams: [-47, -257], // secp256k1 , rsa256
      authenticatorRequireResidentKey:
        options.authenticatorRequireResidentKey || false,
      authenticatorUserVerification:
        options.authenticatorUserVerification || 'required',
    })
  }

  async registrationOptions(
    username: string,
    payload: Uint8Array,
  ): Promise<any> {
    const registrationOptions: any = await this.fido2.attestationOptions()

    const req = {
      challenge: undefined,
      userHandle: undefined,
    } as any
    req.challenge = payload
    // @ts-ignore
    registrationOptions.user.id = username
    registrationOptions.challenge = payload

    // // iOS
    // registrationOptions.authenticatorSelection = {
    //   authenticatorAttachment: 'platform',
    // }
    return {
      ...req,
      ...registrationOptions,
    }
  }

  async signData(
    origin: any,
    credential: any,
    challenge: any,
    payload: Uint8Array,
    uid: Uint8Array,
  ): Promise<any> {
    const updatedCreds = { ...credential, response: {} }
    updatedCreds.rawId = new Uint8Array(
      Buffer.from(credential.rawId, 'base64'),
    ).buffer
    updatedCreds.response.attestationObject = base64url.encode(
      credential.response.attestationObject,
    )
    updatedCreds.response.clientDataJSON = base64url.encode(
      credential.response.clientDataJSON,
    )

    const attestationExpectations = {
      challenge,
      origin,
      factor: 'either',
    }

    try {
      const attestationResult = await this.fido2.attestationResult(
        updatedCreds,
        attestationExpectations,
      )
      const { authnrData, clientData, audit } = attestationResult
      const publicKey = authnrData.get('credentialPublicKeyPem')
      const prevCounter = authnrData.get('counter')

      const assertionOptions = await this.fido2.assertionOptions()

      assertionOptions.challenge = ethers.utils.arrayify(
        ethers.utils.sha256(payload),
      ).buffer
      assertionOptions.allowCredentials = [
        {
          id: new Uint8Array(credential.rawId).buffer,
          type: 'public-key',
        },
      ]
      // @ts-ignore
      const clientAssertion = await navigator.credentials.get({
        publicKey: assertionOptions,
      })
      return {
        authnrData,
        clientData,
        clientDataJSON: (bufferToBase64(clientAssertion.response.clientDataJSON)),
        authenticatorData: (bufferToBase64(clientAssertion.response.authenticatorDatN)),
        signature: (bufferToBase64(clientAssertion.response.signature)),
        audit,
    };

    } catch (e) {
      throw e
    }
  }
}
