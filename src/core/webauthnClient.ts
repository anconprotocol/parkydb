import base64url from 'base64url'
import { ethers } from 'ethers'
import { arrayify, base64 } from 'ethers/lib/utils'
import { ParkyDB } from './db'
import { WebauthnHardwareAuthenticate } from './webauthnServer'

export class WebauthnHardwareClient {
  constructor(
    private server: WebauthnHardwareAuthenticate,
    private db: ParkyDB,
  ) {}

  async registerSign(
    origin: any,
    username: string,
    displayName: string,
    payload: Uint8Array,
    emitPublicKey: (args: any) => Promise<any>,
    isMobile: boolean,
    keepSigning: boolean = true,
  ) {
    try {
      const credentialCreationOptions = await this.server.registrationOptions(
        isMobile,
        username,
        payload,
      )
      const challenge = credentialCreationOptions.challenge

      credentialCreationOptions.challenge = new Uint8Array(
        credentialCreationOptions.challenge,
      )
      credentialCreationOptions.user.id = new Uint8Array(
        credentialCreationOptions.user.id,
      )
      credentialCreationOptions.user.name = username
      credentialCreationOptions.user.displayName = displayName

      let credential
      if (keepSigning) {
        // @ts-ignore
        credential = await navigator.credentials.create({
          publicKey: credentialCreationOptions,
        })

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
        credential = updatedCreds
      } else {
        const creds = await this.db.db.fido2keys.get({ id: 1 })
        if (!!creds) {
          credential = {
            rawId: creds.rawId,
            response: {
              ...creds.credential.response,
            },
          }
        } else {
          // @ts-ignore
          credential = await navigator.credentials.create({
            publicKey: credentialCreationOptions,
          })

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
          await this.db.db.fido2keys.put(
            {
              id: 1,
              credential: {
                ...updatedCreds,
              },
              rawId: credential.rawId,
            },
            1,
          )
          credential = updatedCreds
        }
      }
      const registerResponse = await this.server.signData(
        origin,
        credential,
        challenge,
        arrayify(ethers.utils.sha256(payload)),
        credentialCreationOptions.user.id,
        emitPublicKey,
      )
      return { ...registerResponse }
    } catch (e) {
      // @ts-ignore
      alert(e.message)
      console.error(e)
    }
  }
}
