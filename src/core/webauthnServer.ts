// @ts-ignore

import { ethers } from 'ethers'
  // @ts-ignore
import { Fido2Lib } from 'fido2-lib'
import { window } from 'rxjs'

const base64url = require('base64url')

// // @ts-ignore
// const bufferToBase64 = (buffer) =>
//   btoa(String.fromCharCode(...new Uint8Array(buffer)))
// // @ts-ignore
// const base64ToBuffer = (base64) =>
//   Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
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
      cryptoParams: [-7, -257],
      // authenticatorAttachment: 'platform',
      authenticatorRequireResidentKey:
        options.authenticatorRequireResidentKey || false,
      authenticatorUserVerification:
        options.authenticatorUserVerification || 'required',
    })
  }

  async registrationOptions(): Promise<any> {
    const registrationOptions: any = await this.fido2.attestationOptions()

    const req = {
      challenge: undefined,
      userHandle: undefined,
    } as any
    req.challenge = Buffer.from(registrationOptions.challenge)
    // @ts-ignore
    req.userHandle = ethers.utils.randomBytes(32)
    registrationOptions.user.id = req.userHandle
    registrationOptions.challenge = Buffer.from(registrationOptions.challenge)

    // // iOS
    // registrationOptions.authenticatorSelection = {
    //   authenticatorAttachment: 'platform',
    // }
    return {
      ...registrationOptions,
      ...req,
    }
  }

  async register(origin: any, request: any): Promise<any> {
    const { credential } = request

    const challenge = new Uint8Array(request.challenge).buffer
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

  async verifyOptions(): 
  // @ts-ignore
  Promise<
    import('fido2-lib').PublicKeyCredentialRequestOptions
  > {
    const authnOptions = await this.fido2.assertionOptions()

    // const challenge = Buffer.from(authnOptions.challenge)

    authnOptions.challenge = Buffer.from(authnOptions.challenge)

    return authnOptions
  }

  async verify(
    origin: any,
    verifyReq: {
      challenge: any
      userHandle: any
      credential: any
      publicKey: any
      prevCounter: any
    },
  ): Promise<boolean> {
    const { credential } = verifyReq

    credential.rawId = new Uint8Array(
      Buffer.from(credential.rawId, 'base64'),
    ).buffer

    const challenge = new Uint8Array(verifyReq.challenge).buffer
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
        userHandle: new Uint8Array(Buffer.from(verifyReq.userHandle, 'base64'))
          .buffer, //new Uint8Array(Buffer.from(verifyReq.userHandle.data)).buffer
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
