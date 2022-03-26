const toJsonSchema = require('to-json-schema')
const loki = require('lokijs')
import { Waku, WakuMessage } from 'js-waku'
import { Block } from 'multiformats/block'
import { Observable, OperatorFunction, Subject, tap } from 'rxjs'
import { BlockValue } from '../interfaces/Blockvalue'
import { IDataBuilder } from '../interfaces/IBuilder'
import { IQueryBuilder } from '../interfaces/IQuery'

export interface IMessaging {
  bootstrap(): void
}

export interface ChannelOptions {
  from: string
  middleware: {
    incoming: Array<(a: Observable<any>) => Observable<unknown>>
    outgoing: Array<(a: Observable<any>) => Observable<unknown>>
  }
}

export class MessagingService implements IMessaging {
  waku: any

  constructor() {}

  async load(key: any, data: any): Promise<any> {}

  async bootstrap() {
    this.waku = await Waku.create({ bootstrap: { default: true } })
    await this.waku.waitForRemotePeer()
  }

  async createTopic(
    topic: string,
    blockPublisher: Subject<BlockValue>,
  ): Promise<any> {
    // Topic subscriber observes for DAG blocks (IPLD as bytes)
    const pubsub = new Subject<any>()
    this.waku.relay.addObserver(
      (msg: any) => {
        // TODO: middleware
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

  async createChannel(
    topic: string,
    options: ChannelOptions,
    blockPublisher: Subject<BlockValue>,
  ): Promise<any> {
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
      .subscribe(async (block: unknown) => {
        const msg = await WakuMessage.fromBytes(block as any, topic)
        await this.waku.relay.send(msg,)
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
          ...options.middleware.incoming,
        ),
      close: () => {
        if (cancel) cancel.unsubscribe()
      },
    }
  }
}
