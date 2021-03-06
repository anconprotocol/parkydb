const { Crypto } = require('@peculiar/webcrypto')
const crypto = new Crypto()
// @ts-ignore
if (!global.window) {
  // @ts-ignore
  global.crypto = crypto
}
import * as sigUtil from '@metamask/eth-sig-util'
import { SignTypedDataVersion } from '@metamask/eth-sig-util'
import { Waku, WakuMessage } from 'js-waku'
import { BlockCodec } from 'multiformats/codecs/interface'
import {
  BlockValue,
  ChannelTopic,
  PacketPayload,
  PublicKeyMessage,
  PubsubTopic,
  SecurePacketPayload,
  StorageBlock,
} from 'parkydb-interfaces'
import { map, mergeMap, Observable, of, Subject, tap } from 'rxjs'

export interface IMessaging {
  bootstrap(options: any): void
}

export interface ChannelOptions {
  pk?: string
  pub?: string
  encryptionPubKey?: string
  from?: string
  sigkey?: string
  canPublish?: boolean
  canDecrypt?: boolean
  isCRDT?: boolean
  isKeyExchangeChannel?: boolean
  canSubscribe?: boolean
  blockCodec: BlockCodec<any, unknown>
  middleware: {
    incoming: Array<(a: Observable<any>) => Observable<unknown>>
    outgoing: Array<(a: Observable<any>) => Observable<unknown>>
  }
}

export class MessagingService implements IMessaging {
  // @ts-ignore
  waku: Waku

  constructor(public web3Provider: any, public defaultAddress: string) {}

  async load(key: any, data: any): Promise<any> {}

  async bootstrap(options: any) {
    const config = options || { bootstrap: { default: true } }
    this.waku = await Waku.create(config)
    const available = await this.waku.waitForRemotePeer()
    return { waku: this.waku, connected: available }
  }

  async signEncryptionKey(
    appName: string,
    encryptionPublicKeyHex: string,
    ownerAddressHex: string,
    providerRequest: (request: {
      method: string
      from: string
      params?: Array<any>
    }) => Promise<any>,
  ): Promise<string> {
    const msgParams = this.buildMsgParams(
      appName,
      encryptionPublicKeyHex,
      ownerAddressHex,
    )

    return providerRequest({
      method: 'eth_signTypedData_v4',
      params: [ownerAddressHex, msgParams],
      from: ownerAddressHex,
    })
  }

  buildBlockDocument(topicDomainName: string, storageBlock: StorageBlock) {
    return JSON.stringify({
      domain: {
        name: topicDomainName,
        version: '1',
      },
      message: {
        ...storageBlock,
      },
      primaryType: 'StorageBlock',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        StorageAsset: [
          { name: 'name', type: 'string' },
          { name: 'kind', type: 'string' },
          { name: 'timestamp', type: 'number' },
          { name: 'description', type: 'string' },
          { name: 'image', type: 'string' },
          { name: 'sources', type: 'string[]' },
          { name: 'owner', type: 'string' },
        ],
        StorageBlock: [
          { name: 'content', type: 'StorageAsset' },
          { name: 'kind', type: 'string' },
          { name: 'timestamp', type: 'string' },
          { name: 'issuer', type: 'string' },
        ],
      },
    })
  }

  buildMsgParams(
    topicDomainName: string,
    encryptionPublicKeyHex: string,
    ownerAddressHex: string,
  ) {
    return JSON.stringify({
      domain: {
        name: topicDomainName,
        version: '1',
      },
      message: {
        message:
          'By signing this message you certify that messages addressed to `ownerAddress` must be encrypted with `encryptionPublicKey`',
        encryptionPublicKey: encryptionPublicKeyHex,
        ownerAddress: ownerAddressHex,
      },
      primaryType: 'PublishEncryptionPublicKey',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        PublishEncryptionPublicKey: [
          { name: 'message', type: 'string' },
          { name: 'encryptionPublicKey', type: 'string' },
          { name: 'ownerAddress', type: 'string' },
        ],
      },
    })
  }

  validatePublicKeyMessage(domainName: string, msg: PublicKeyMessage): boolean {
    const recovered = sigUtil.recoverTypedSignature({
      data: JSON.parse(
        this.buildMsgParams(
          domainName,
          msg.encryptionPublicKey,
          msg.ethAddress,
        ),
      ),
      signature: msg.signature,
      version: SignTypedDataVersion.V4,
    })

    return recovered === msg.ethAddress
  }

  async subscribeStore(topics: string[], timeFilter: any) {
    const p = this.waku.store.queryHistory(topics, {
      timeFilter,
    })
    return of(p).pipe(
      mergeMap((x) => x),
      mergeMap((x) => x),
    )
  }
  /**
   * Creates a pubsub topic. Note topic format must be IPLD dag-json or dag-cbor
   * @param topic
   * @param options
   * @param blockPublisher
   * @returns
   */
  async createTopic(
    topic: string,
    options: ChannelOptions,
  ): Promise<PubsubTopic> {
    if (options.canDecrypt) {
      this.waku.addDecryptionKey(options.sigkey as any)
    }
    let pub = new Subject<any>()
    let pub$ = pub.pipe()
    if (options.middleware && options.middleware.outgoing) {
      pub$ = pub.pipe(
        tap(),
        tap(),
        tap(),
        tap(),
        tap(),
        tap(),
        tap(),
        tap(),
        tap(),
        tap(),
        tap(),
        ...options.middleware.outgoing,
      )
    }

    // Topic subscriber observes for DAG blocks (IPLD as bytes)
    let pubsub = new Subject<any>()
    if (options.canSubscribe) {
      this.waku.relay.addObserver(
        async (msg: any) => {
          let message = (await options.blockCodec.decode(
            msg.payload,
          )) as PacketPayload
          if (this.defaultAddress) {
            message = (await options.blockCodec.decode(
              msg.payload,
            )) as SecurePacketPayload
          }
          if (msg.contentTopic === topic) {
            pubsub.next({ message: msg, decoded: message })
          }
        },
        [topic],
      )
    }

    let onBlockReply$ = pubsub.asObservable()
    if (options.middleware && options.middleware.incoming) {
      onBlockReply$ = pubsub
        .asObservable()
        .pipe(
          tap(),
          tap(),
          tap(),
          tap(),
          tap(),
          tap(),
          tap(),
          tap(),
          tap(),
          tap(),
          ...options.middleware.incoming,
        )
    }

    // Topic publisher observes for block publisher and sends these blocks with Waku P2P
    let cancel: { unsubscribe: () => void }

    if (options.canPublish) {
      // @ts-ignore
      cancel = pub$.subscribe(async (block: any) => {
        let message: any = { payload: block }
        if (this.defaultAddress) {
          const msg = this.buildBlockDocument('data.universal', block as any)

          let sig = null
          if (!options.isCRDT) {
            sig = await this.web3Provider.provider.send({
              method: 'eth_signTypedData_v4',
              params: [this.defaultAddress, msg],
              from: this.defaultAddress,
            })
          }
          const pubkeyMessage = {
            signature: sig,
            ethAddress: this.defaultAddress,
            encryptionPublicKey: options.encryptionPubKey,
          } as PublicKeyMessage

          message = {
            payload: {
              ...block,
              signature: sig,
            },
            publicKeyMessage: pubkeyMessage,
          } as SecurePacketPayload
        }

        const packed = await options.blockCodec.encode(message)
        let config: any = {}
        const msg = await WakuMessage.fromBytes(packed, topic, config)
        await this.waku.relay.send(msg)
      })
    }
    return {
      onBlockReply$,
      publish: (block: any) => {
        return pub.next(block)
      },
      close: () => {
        if (cancel) {
          cancel.unsubscribe()
        }
      },
    }
  }
}
