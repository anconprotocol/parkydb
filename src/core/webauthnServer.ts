
import { Fido2Lib } from 'fido2-lib'

const base64url = require('base64url');

const { Crypto } = require('@peculiar/webcrypto')
const crypto = new Crypto()
// @ts-ignore
if (!global.window) {
  global.crypto = crypto
}

export class WebauthnHardwareAuthenticate {
  constructor(private fido2: Fido2Lib) {}

  initialize(options: { rpId: any; rpName: any; rpIcon: any; }) {
    this.fido2 = new Fido2Lib({
      timeout: 60000,
      rpId: options.rpId || 'parkydb',
      rpName: options.rpName || 'ParkyDB',
      rpIcon: options.rpIcon || '',
      challengeSize: 128,
      attestation: 'none',
      cryptoParams: [-7, -257],
      authenticatorAttachment: 'platform',
      authenticatorRequireResidentKey: false,
      authenticatorUserVerification: 'required',
    })
  }

  async registrationOptions(): Promise<any> {
    const registrationOptions: any = await this.fido2.attestationOptions()

    const req = {
        challenge: undefined,
        userHandle: undefined,
    } as any
    req.challenge = Buffer.from(registrationOptions.challenge)
    req.userHandle = crypto.randomBytes(32)

    registrationOptions.user.id = req.userHandle
    registrationOptions.challenge = Buffer.from(registrationOptions.challenge)

    // iOS
    registrationOptions.authenticatorSelection = {
      authenticatorAttachment: 'platform',
    }

    return req
  }

  async register(request: any): Promise<any> {
    const { credential } = request

    const challenge = new Uint8Array(request.challenge.data).buffer
    credential.rawId = new Uint8Array(
      Buffer.from(credential.rawId, 'base64'),
    ).buffer
    credential.response.attestationObject = base64url.decode(
      credential.response.attestationObject,
      'base64',
    )
    credential.response.clientDataJSON = base64url.decode(
      credential.response.clientDataJSON,
      'base64',
    )

    const attestationExpectations = {
      challenge,
      origin,
      factor: 'either',
    }

    try {
      const regResult = await this.fido2.attestationResult(
        credential,
        attestationExpectations as any,
      )

      request.publicKey = regResult.authnrData.get('credentialPublicKeyPem')
      request.prevCounter = regResult.authnrData.get('counter')

      return request
    } catch (e) {
      throw e
    }
  }

  async verifyOptions(): Promise<import("fido2-lib").PublicKeyCredentialRequestOptions> {
    const authnOptions = await this.fido2.assertionOptions()

    // const challenge = Buffer.from(authnOptions.challenge)

    authnOptions.challenge = Buffer.from(authnOptions.challenge)

    return authnOptions
  }

  async verify(verifyReq: { challenge: any; userHandle: any; credential: any; publicKey: any; prevCounter: any; }): Promise<boolean> {
    const { credential } = verifyReq

    credential.rawId = new Uint8Array(
      Buffer.from(credential.rawId, 'base64'),
    ).buffer

    const challenge = new Uint8Array(verifyReq.challenge.data).buffer
    const { publicKey, prevCounter } = verifyReq

    if (publicKey === 'undefined' || prevCounter === undefined) {
      return false
    } else {
      const assertionExpectations = {
        challenge,
        origin,
        factor: 'either',
        publicKey,
        prevCounter,
        userHandle: new Uint8Array(
          Buffer.from(verifyReq.userHandle, 'base64'),
        ).buffer, //new Uint8Array(Buffer.from(verifyReq.userHandle.data)).buffer
      } as any

      try {
        await this.fido2.assertionResult(credential, assertionExpectations) // will throw on error

        return true
      } catch (e) {
        console.log('error', e)
        return false
      }
    }
  }
}
