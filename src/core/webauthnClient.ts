import base64url from 'base64url'
import { base64 } from 'ethers/lib/utils'
import { WebauthnHardwareAuthenticate } from './webauthnServer'
// @ts-ignore
const bufferToBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
// @ts-ignore
const base64ToBuffer = (base64) =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))

export class WebauthnHardwareClient {
  constructor(private server: WebauthnHardwareAuthenticate) {}

  async register(origin: any, username: string, displayName: string) {
    try {
      const credentialCreationOptions = await this.server.registrationOptions()
      const challenge = credentialCreationOptions.challenge

      credentialCreationOptions.challenge = new Uint8Array(
        credentialCreationOptions.challenge,
      )
      credentialCreationOptions.user.id = new Uint8Array(
        credentialCreationOptions.user.id,
      )
      credentialCreationOptions.user.name = username
      credentialCreationOptions.user.displayName = displayName

      // @ts-ignore
      const credential: any = await navigator.credentials.create({
        publicKey: credentialCreationOptions,
      })

      const credentialId = base64url.encode(credential.rawId)

      const data = {
        rawId: credentialId,
        response: {
          attestationObject: base64url.encode(
            credential.response.attestationObject,
          ),
          clientDataJSON: base64url.encode(credential.response.clientDataJSON),
          id: credential.id,
          type: credential.type,
        },
      }
      const registerResponse = await this.server.register(origin, {
        credential: data,
        challenge,
      })
      return { registerResponse, credential: data }
    } catch (e) {
      // @ts-ignore
      alert(e.message)
      console.error(e)
    }
  }

  async verify(
    origin: any,
    registerResponse: { publicKey: string; prevCounter: any },
    userCredential: any,
  ): Promise<any> {
    try {
      const credentialRequestOptions: any = await this.server.verifyOptions()

      credentialRequestOptions.challenge = new Uint8Array(
        credentialRequestOptions.challenge.data,
      )
      credentialRequestOptions.allowCredentials = [
        {
          id: base64ToBuffer(userCredential.rawId),
          type: 'public-key',
          transports: ['internal'],
        },
      ]
      // @ts-ignore

      const credential: any = await navigator.credentials.get({
        publicKey: credentialRequestOptions,
      })

      const data = {
        rawId: bufferToBase64(credential.rawId),
        response: {
          authenticatorData: bufferToBase64(
            credential.response.authenticatorData,
          ),
          signature: bufferToBase64(credential.response.signature),
          userHandle: bufferToBase64(credential.response.userHandle),
          clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
          id: credential.id,
          type: credential.type,
        },
      }

      return this.server.verify(origin, {
        credential: data,
        prevCounter: registerResponse.prevCounter,
        publicKey: registerResponse.publicKey,
        userHandle: credential.response.userHandle,
        challenge: credentialRequestOptions.challenge,
      })
    } catch (e) {
      console.error('authentication failed', e)
    } finally {
    }
  }
}
