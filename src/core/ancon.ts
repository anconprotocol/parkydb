import { ethers } from 'ethers'
import WalletConnectProvider from '@walletconnect/web3-provider'

interface Signer {
  signature: string
  digest?: string
}

export class AnconService {
  constructor(private provider: WalletConnectProvider, private rpc: string) {}

  async sign(data: any): Promise<Signer> {
    // sign message {signature, digest / hash, }
    const b = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data))

    const res = await this.provider.send({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_sign',
      params: [this.provider.accounts[0], b],
    })

    const signature = res

    return { digest: b, signature }
  }
  async createDid(
    did: { ethrdid?: string; did?: string },
    pubkey: any,
    message?: any,
    customSigner?: (message: any) => Promise<Signer>,
  ) {
    // encode the pub key
    const base58Encode = ethers.utils.base58.encode(pubkey)
    let signer = this.sign
    const messageDid: any =
      message ||
      `#Welcome to Ancon Protocol!
    
        For more information read the docs https://anconprotocol.github.io/docs/
    
        To make free posts and gets to the DAG Store you have to enroll and pay the service fee
    
        This request will not trigger a blockchain transaction or cost any gas fees.
        by signing this message you accept the terms and conditions of Ancon Protocol
        `
    if (!!customSigner) {
      signer = customSigner
    }
    const { signature, digest } = await signer(messageDid)

    const payload = {
      ...did,
      pub: base58Encode,
      signature: signature,
      message: message,
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }

    // @ts-ignore
    const rawResponse = await fetch(
      // @ts-ignore
      `${this.rpc}/v0/did`,
      requestOptions,
    )
    //   json response
    return rawResponse.json()
  }

  async createDagBlock(
    from: string,
    options: { topic: string; message: string },
    customSigner?: (message: any) => Promise<Signer>,
  ) {
    let signer = this.sign    
    if (!!customSigner) {
      signer = customSigner
    }
    const { signature, digest } = await signer(JSON.stringify(options.message))

    let payload = {
      path: '/',
      from,
      signature,
      //      topic: options.topic,
      data: options.message,
    } as any

    if (options.topic) {
      payload.topic = options.topic
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }

    // @ts-ignore
    const rawResponse = await fetch(
      // @ts-ignore
      `${this.rpc}/v0/dag`,
      requestOptions,
    )
    //   json response
    return rawResponse.json()
  }
}
