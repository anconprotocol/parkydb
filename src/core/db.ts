const fakeIndexedDB = require('fake-indexeddb')
const fakeIDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')

const { Crypto } = require('@peculiar/webcrypto')
const crypto = new Crypto()
// @ts-ignore
if (!global.window) {
  global.crypto = crypto
}
import { CID } from 'blockstore-core/base'
import Dexie, { liveQuery, Table } from 'dexie'
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
import { Ed25519 } from '../wallet/ed25519keyring'
import { Simple } from '../wallet/simple'
import { ethers } from 'ethers'
const { MerkleJson } = require('merkle-json')

/**
 * ParkyDB core class
 */
export class ParkyDB {
  private keyringController = new WalletController()
  private dagService = new DAGJsonService()
  private graphqlService = new GraphqlService()
  private jsonschemaService = new JsonSchemaService()

  private hooks = new Hooks()
  private onBlockCreated = new Subject<BlockValue>()
  db: any
  private messagingService: MessagingService

  constructor() {
    const db: Dexie | any = new Dexie(
      'ancon',
      global.window
        ? {}
        : {
            indexedDB: fakeIndexedDB,
            IDBKeyRange: fakeIDBKeyRange,
          },
    )

    db.version(1).stores({
      keyring: `id`,
      history: `&cid, refs`,
      blockdb: `
        ++id,
        &cid,
        uuid,
        topic,
        kind,
        timestamp`,
    })

    this.db = db
    this.db.blockdb.hook(
      'creating',
      this.hooks.attachRouter(this.onBlockCreated),
    )
    this.messagingService = new MessagingService(undefined, '', '')
  }

  async initialize(options: any = { wakuconnect: null }) {
    await this.keyringController.load(this.db)

    if (options.withWallet) {
      if (options.withWallet.autoLogin) {
        try {
          const kr = await this.keyringController.keyringController.submitPassword(
            options.withWallet.password,
          )
        } catch (e) {
          await this.keyringController.createVault(
            options.withWallet.password,
            options.withWallet.seed,
          )
        }
      }
    }
    if (options.withWeb3) {
      this.messagingService = new MessagingService(
        options.withWeb3.provider,
        options.withWeb3.pubkey,
        options.withWeb3.defaultAddress,
      )
    }

    options.withWallet.password = undefined
    return this.messagingService.bootstrap(options.wakuconnect)
  }

  async putBlock(payload: any, options: any = {}) {
    const block = await this.dagService.build({ ...payload, ...options })
    const has = await this.get(block.cid.toString(), null)
    if (!!has) {
      return { id: block.cid.toString(), model: has }
    } else {
      await this.put(block.cid, block)

      return { id: block.cid.toString() }
    }
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
  async getWallet(): Promise<any> {
    // await this.keyringController.load(this.db)
    return this.keyringController.keyringController
  }

  async createChannelPubsub(topic: string, options: ChannelOptions) {
    const w = await this.getWallet()
    let from = options.from
    if (from === '') {
      const acct = await w.getAccounts()
      from = acct[0]
    }

    const h = await w.exportAccount(from)

    const sigkey = Buffer.from(h, 'hex')
    const pubkey = getPublicKey(sigkey)
    return this.messagingService.createChannel(
      topic,
      { ...options, sigkey, pubkey },
      this.onBlockCreated,
    )
  }

  async createAnconDid(options: {
    api: string
    chainId: string
    from: string
  }) {
    const w = await this.getWallet()
    let from = options.from
    if (from === '') {
      const acct = await w.getAccounts()
      from = acct[0]
    }
    const h = await w.exportAccount(from)
    const sigkey = Buffer.from(h, 'hex')
    const pubkey = getPublicKey(sigkey)
    // encode the pub key
    const base58Encode = ethers.utils.base58.encode(pubkey)

    const message = `#Welcome to Ancon Protocol!

    For more information read the docs https://anconprotocol.github.io/docs/

    To make free posts and gets to the DAG Store you have to enroll and pay the service fee

    This request will not trigger a blockchain transaction or cost any gas fees.
    by signing this message you accept the terms and conditions of Ancon Protocol
    `
    const signature = await w.signPersonalMessage({
      from,
      data: ethers.utils.hashMessage(message),
    })

    //post to get the did
    const payload = {
      ethrdid: `did:ethr:${options.chainId}:${from}`,
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
      `${api}/v0/did`,
      requestOptions,
    )
    //   json response
    return rawResponse.json()
  }

  async createAnconBlock(options: {
    api: string
    topic: string
    chainId: string
    from: string
    message: string
  }) {
    const w = await this.getWallet()
    let from = options.from
    if (from === '') {
      const acct = await w.getAccounts()
      from = acct[0]
    }

    const signature = await w.signPersonalMessage({
      from,
      data: ethers.utils.hashMessage(options.message),
    })

    const payload = {
      path: '/',
      from: `did:ethr:${options.chainId}:${from}`,
      signature,
      topic: options.topic,
      data: options.message,
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }

    // fetch
    const rawResponse = await fetch(
      // @ts-ignore
      `${api}/v0/dag`,
      requestOptions,
    )
    //   json response
    return rawResponse.json()
  }

  async aggregate(topic: string[], options: ChannelOptions) {
    const w = await this.getWallet()
    let from = options.from
    if (from === '') {
      const acct = await w.getAccounts()
      from = acct[0]
    }

    const h = await w.exportAccount(from)

    const sigkey = Buffer.from(h, 'hex')
    const pubkey = getPublicKey(sigkey)
    return this.messagingService.aggregate(topic, {
      ...options,
      sigkey,
      pubkey,
    })
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
  async queryBlocks$(fn: (blocks: Table) => () => unknown) {
    return liveQuery(fn(this.db.blockdb))
  }

  /**
   *
   * @param options
   * @returns
   */
  async getBlocksByTableName$(tableName: string, fn: (table: Table) => () => unknown) {
    return liveQuery(fn(this.db[tableName]))
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
