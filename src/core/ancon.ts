import { ethers } from 'ethers'
import WalletConnectProvider from '@walletconnect/web3-provider'

export class AnconService {
  constructor(
    private provider: WalletConnectProvider,
    private rpc: string,
  ) {}

  async sign(data: any) {
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
  async createDid(pubkey: any) {
    // encode the pub key
    const base58Encode = ethers.utils.base58.encode(pubkey)

    const message = `#Welcome to Ancon Protocol!
    
        For more information read the docs https://anconprotocol.github.io/docs/
    
        To make free posts and gets to the DAG Store you have to enroll and pay the service fee
    
        This request will not trigger a blockchain transaction or cost any gas fees.
        by signing this message you accept the terms and conditions of Ancon Protocol
        `
    const { signature, digest } = await this.sign(
      message,
    )
    const web3provider = new ethers.providers.Web3Provider(this.provider)
    const network = await web3provider.getNetwork()
    const payload = {
      ethrdid: `did:ethr:${network.name}:${this.provider.accounts[0]}`,
      pub: base58Encode,
      signature: signature,
      message: message,
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }

    // fetch
    const rawResponse = await fetch(
      // @ts-ignore
      `${this.rpc}/v0/did`,
      requestOptions,
    )
    //   json response
    return rawResponse.json()
  }

  async createDagBlock(options: { topic: string; message: string }) {
    const { signature, digest } = await this.sign(
      JSON.stringify(options.message),
    )
    const web3provider = new ethers.providers.Web3Provider(this.provider)
    const network = await web3provider.getNetwork()
    let payload = {
      path: '/',
      from: `did:ethr:${network.name}:${this.provider.accounts[0]}`,
      signature,
//      topic: options.topic,
      data: options.message,
    } as any
      
    if (options.topic){
      payload.topic = options.topic
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }

    // fetch
    const rawResponse = await fetch(
      // @ts-ignore
      `${this.rpc}/v0/dag`,
      requestOptions,
    )
    //   json response
    return rawResponse.json()
  }
}
