const toJsonSchema = require('to-json-schema')
const loki = require('lokijs')
import { Waku, WakuMessage } from 'js-waku'
import { Block } from 'multiformats/block'
import { Subject } from 'rxjs'
import { BlockValue } from '../interfaces/Blockvalue'
import { IDataBuilder } from '../interfaces/IBuilder'
import { IQueryBuilder } from '../interfaces/IQuery'

export interface IMessaging {
  bootstrap(): void
}

export class MessagingService implements IMessaging {
  waku: any

  constructor() {}

  async load(key: any, data: any): Promise<any> {}

  async bootstrap() {
    this.waku = await Waku.create({ bootstrap: { default: true } })
    await this.waku.waitForRemotePeer()
  }

  async createTopic(topic: string): Promise<any> {
    const pubsub = new Subject<any>()
    this.waku.relay.addObserver(pubsub.next, [topic])

    return {
      publish: async (block: BlockValue) => {
        const msg = await WakuMessage.fromBytes(block.dag.bytes, topic)
        this.waku.relay.send(msg)
      },
    }
  }
}
