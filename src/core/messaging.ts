const { Crypto } = require("@peculiar/webcrypto");

const crypto = new Crypto();
global.crypto = crypto;
import { Waku, WakuMessage } from 'js-waku'
import { Codec } from 'multiformats/bases/base'
import { BlockCodec, ByteView } from 'multiformats/codecs/interface'
import { map, Observable, Subject, tap } from 'rxjs'
import { ChannelCodeEnum } from '../interfaces/BlockCodec'
import { BlockValue } from '../interfaces/Blockvalue'
import { ChannelTopic } from '../interfaces/ChannelTopic'
import { PubsubTopic } from '../interfaces/PubsubTopic'
export interface IMessaging {
  bootstrap(): void
}

export interface ChannelOptions {
  from: string
  sigkey?:Uint8Array
  pubkey?:Uint8Array
  blockCodec: BlockCodec<any, unknown>
  middleware: {
    incoming: Array<(a: Observable<any>) => Observable<unknown>>
    outgoing: Array<(a: Observable<any>) => Observable<unknown>>
  }
}

export class MessagingService implements IMessaging {
  // @ts-ignore
  waku: Waku

  constructor() {}

  async load(key: any, data: any): Promise<any> {}

  async bootstrap() {
    this.waku = await Waku.create({ bootstrap: { default: true } })
    await this.waku.waitForRemotePeer()
  }

  /**
   * Creates a pubsub topic. Note topic format must be IPLD dag-json or dag-cbor
   * @param topic
   * @param blockPublisher
   * @returns
   */
  async createTopic(
    topic: string,
    blockPublisher: Subject<BlockValue>,
  ): Promise<PubsubTopic> {
    // Topic subscriber observes for DAG blocks (IPLD as bytes)
    const pubsub = new Subject<any>()
    this.waku.relay.addObserver(
      (msg: any) => {
        pubsub.next(msg)
      },
      [topic],
    )

    // Topic publisher observes for block publisher and sends these blocks with Waku P2P
    const cancel = blockPublisher.subscribe(async (block: BlockValue) => {
      const msg = await WakuMessage.fromBytes(block.dag.bytes, topic)
      await this.waku.relay.send(msg)
    })

    return {
      onBlockReply$: pubsub.asObservable(),
      // on demand publishing
      publish: async (block: BlockValue) => {
        const msg = await WakuMessage.fromBytes(block.dag.bytes, topic)
        return this.waku.relay.send(msg)
      },
      close: () => {
        if (cancel) cancel.unsubscribe()
      },
    }
  }

  /**
   * Creates a data channel, is similar to a pubsub topic but used for data messaging exchanges
   * @param topic
   * @param options
   * @param blockPublisher
   * @returns
   */
  async createChannel(
    topic: string,
    options: ChannelOptions,
    blockPublisher: Subject<BlockValue>,
  ): Promise<ChannelTopic> {
    // Topic subscriber observes for DAG blocks (IPLD as bytes)
    const pubsub = new Subject<any>()
    this.waku.relay.addObserver(
      (msg: any) => {
        if (options.middleware) {
          pubsub.next(msg)
        }
      },
      [topic],
    )

    // Topic publisher observes for block publisher and sends these blocks with Waku P2P
    const cancel = blockPublisher
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
        tap(),
        ...options.middleware.outgoing,
      )
      .subscribe(async (block: any) => {
        const view = options.blockCodec.encode(block)
        console.log(view)
        const msg = await WakuMessage.fromBytes(view, topic, {
          encPublicKey: options.pubkey,
          sigPrivKey: options.sigkey,
        })
        await this.waku.relay.send(msg)
      })

    return {
      onBlockReply$: pubsub
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
          tap(),
          ...options.middleware.incoming.concat(
            map((i: Uint8Array) => options.blockCodec.decode(i)),
          ),
        ),
      close: () => {
        if (cancel) cancel.unsubscribe()
      },
    }
  }
}
