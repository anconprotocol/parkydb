import base64url from 'base64url'
import { ethers } from 'ethers'
import { arrayify, base64 } from 'ethers/lib/utils'
import { WebauthnHardwareAuthenticate } from './webauthnServer'

export class WebauthnHardwareClient {
  constructor(private server: WebauthnHardwareAuthenticate) {}

  async register(origin: any, username: string, displayName: string, payload: Uint8Array) {
    try {
      const credentialCreationOptions = await this.server.registrationOptions(username, payload)
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

      // const credentialId = bufferToBase64(credential.rawId)

      // const data = {
      //   rawId: credentialId,
      //   response: {
      //     attestationObject: base64url.encode(
      //       credential.response.attestationObject,
      //     ),
      //     clientDataJSON: base64url.encode(credential.response.clientDataJSON),
      //     id: credential.id,
      //     type: credential.type,
      //   },
      // }
      const registerResponse = await this.server.signData(
        origin,
        credential,
        challenge,
       arrayify(ethers.utils.sha256(payload)),
        credentialCreationOptions.user.id,
      )
      return { ...registerResponse, }
    } catch (e) {
      // @ts-ignore
      alert(e.message)
      console.error(e)
    }
  }
 }
