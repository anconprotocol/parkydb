import { base64 } from 'ethers/lib/utils'
import { WebauthnHardwareAuthenticate } from './webauthnServer'


export class WebauthnHardwareClient {
  constructor(private server: WebauthnHardwareAuthenticate) {}

  async register(origin: any,username: string, displayName: string) {
    try {
      const credentialCreationOptions = await this.server.registrationOptions()

      credentialCreationOptions.challenge = new Uint8Array(
        credentialCreationOptions.challenge.data,
      )
      credentialCreationOptions.user.id = new Uint8Array(
        credentialCreationOptions.user.id.data,
      )
      credentialCreationOptions.user.name = username
      credentialCreationOptions.user.displayName = displayName

// @ts-ignore
const credential: any = await navigator.credentials.create({
        publicKey: credentialCreationOptions,
      })

      const credentialId = base64.encode(credential.rawId)

      const data = {
        rawId: credentialId,
        response: {
          attestationObject: base64.encode(
            credential.response.attestationObject,
          ),
          clientDataJSON: base64.encode(credential.response.clientDataJSON),
          id: credential.id,
          type: credential.type,
        },
      }

      const registerResponse = await this.server.register(origin,{ credential: data })

      return { registerResponse, credential: data }
    } catch (e) {}
  }

  async verify(origin: any,registerResponse: {publicKey: string, prevCounter: any}, userCredential: any): Promise<any> {
    try {
      const credentialRequestOptions: any = await this.server.verifyOptions()

      credentialRequestOptions.challenge = new Uint8Array(
        credentialRequestOptions.challenge.data,
      )
      credentialRequestOptions.allowCredentials = [
        {
          id: base64.encode(userCredential.rawId),
          type: 'public-key',
          transports: ['internal'],
        },
      ]
// @ts-ignore

      const credential: any = await navigator.credentials.get({
        publicKey: credentialRequestOptions,
      })

      const data = {
        rawId: base64.encode(credential.rawId),
        response: {
          authenticatorData: base64.encode(
            credential.response.authenticatorData,
          ),
          signature: base64.encode(credential.response.signature),
          userHandle: base64.encode(credential.response.userHandle),
          clientDataJSON: base64.encode(credential.response.clientDataJSON),
          id: credential.id,
          type: credential.type,
        },
      }

      return this.server.verify(origin,{
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
