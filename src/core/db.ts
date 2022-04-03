const fakeIndexedDB = require('fake-indexeddb')
const fakeIDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')

const { Crypto } = require('@peculiar/webcrypto')
const crypto = new Crypto()
if (!window.crypto) {
  global.crypto = crypto
}
import { CID } from 'blockstore-core/base'
import Dexie from 'dexie'
import 'dexie-observable/api'

import MiniSearch from 'minisearch'
import { Block } from 'multiformats/block'
import { DAGJsonService } from './dagjson'
import { GraphqlService } from '../query/graphql'
import { JsonSchemaService } from './jsonschema'
import { ServiceContext } from '../interfaces/ServiceContext'
import { ChannelOptions, MessagingService } from './messaging'
import { Hooks } from './hooks'
import { Subject } from 'rxjs'
import { BlockValue } from '../interfaces/Blockvalue'
import { WalletController } from '../wallet/controller'
import { getPublicKey } from 'js-waku'
const { MerkleJson } = require('merkle-json')

/**
 * ParkyDB core class
 */
export class ParkyDB extends WalletController {
  private dagService = new DAGJsonService()
  private graphqlService = new GraphqlService()
  private jsonschemaService = new JsonSchemaService()
  private messagingService = new MessagingService()

  private hooks = new Hooks()
  private onBlockCreated = new Subject<BlockValue>()
  db: any

  constructor() {
    super()

    const db: Dexie | any = new Dexie('ancon', {
      indexedDB: fakeIndexedDB,
      IDBKeyRange: fakeIDBKeyRange,
    })

    db.version(1).stores({
      keyring: `&id`,
      blockdb: `
        &cid,
        topic,
        timestamp`,
    })

    this.db = db
  }

  async initialize(options: any = {}) {
    await this.messagingService.bootstrap({ ...options.wakuconnect })

    if (options.withWallet) {
      await this.load(this.db)
      await this.createVault(
        options.withWallet.password,
        options.withWallet.seed,
      )
    }
    this.db.blockdb.hook(
      'creating',
      this.hooks.attachRouter(this.onBlockCreated),
    )
  }
  async putBlock(payload: any, options: any = {}) {
    const block = await this.dagService.build({ ...payload, ...options })
    return this.put(block.cid, block)
  }
  async put(key: CID, value: Block<any>) {
    const jsch = await this.jsonschemaService.build(value.value)
    const mj = new MerkleJson()
    const miniSearch = new MiniSearch({
      fields: Object.keys(value.value),
    })

    await miniSearch.addAllAsync([{ id: key.toString(), ...value.value }])
    return this.db.blockdb.put({
      cid: key.toString(),
      dag: value,
      document: value.value,
      schemas: {
        jsonschema: jsch,
        graphqls: await this.graphqlService.build(value.value),
      },
      hashtag: mj.hash(value.value),
      index: JSON.stringify(miniSearch),
      timestamp: new Date().getTime(),
    })
  }

  async createTopicPubsub(topic: string) {
    // creates an observable and subscribes to store block creation
    return this.messagingService.createTopic(topic, this.onBlockCreated)
  }

  async createChannelPubsub(topic: string, options: ChannelOptions) {
    const h = await this.wallet.exportAccount(options.from)

    const sigkey = Buffer.from(h, 'hex')
    const pubkey = getPublicKey(sigkey)
    return this.messagingService.createChannel(
      topic,
      { ...options, sigkey, pubkey },
      this.onBlockCreated,
    )
  }

  /**
   *
   * @param key
   * @param options
   * @returns
   */
  async get(key: any, options: any = {}) {
    return this.db.blockdb.get({ cid: key })
  }

  /**
   *
   * @param options
   * @returns
   */
  async filter(options: any) {
    const props = this.db.blockdb.get({ cid: options.key })
    return props
  }

  /**
   *
   * @param options
   * @returns
   */
  async query(options: any) {
    const ctx = {
      ...options,
      db: this.db,
    } as ServiceContext
    return this.graphqlService.query(ctx, null)
  }
}
