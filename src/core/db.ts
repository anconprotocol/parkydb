const fakeIndexedDB = require('fake-indexeddb')
const fakeIDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')

const { Crypto } = require('@peculiar/webcrypto')
const crypto = new Crypto()
// @ts-ignore
if (!global.window) {
  // @ts-ignore
  global.crypto = crypto
}
import { CID } from 'blockstore-core/base'
import Dexie, { liveQuery, Table } from 'dexie'
import 'dexie-observable/api'

import { v4 as uuidv4 } from 'uuid'
import MiniSearch from 'minisearch'
import { Block, ByteView } from 'multiformats/block'
import { DAGJsonService } from './dagjson'
import { GraphqlService } from '../query/graphql'
import { JsonSchemaService } from './jsonschema'
import { ServiceContext } from '../interfaces/ServiceContext'
import { ChannelOptions, MessagingService } from './messaging'
import { Hooks } from './hooks'
import { async, filter, lastValueFrom, map, Observable, Subject } from 'rxjs'
import { BlockValue } from '../interfaces/Blockvalue'
import { WalletController } from '../wallet/controller'
import { generatePrivateKey, getPublicKey } from 'js-waku'
import { Ed25519 } from '../wallet/ed25519keyring'
import { Simple } from '../wallet/simple'
import { ethers } from 'ethers'
import { AnconService } from './ancon'
import { IPFSService } from './ipfs'
import { hexlify } from 'ethers/lib/utils'
import { decode, encode } from 'cbor-x'
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
  // @ts-ignore
  private anconService: AnconService
  // @ts-ignore
  private messagingService: MessagingService
  // @ts-ignore
  private ipfsService: IPFSService
  db: any
  // @ts-ignore
  syncTopic: string
  syncPubsub: any
  syncPubsubDexie: any
  store: any
  constructor(name: string) {
    const db: Dexie | any = new Dexie(
      name,
      // @ts-ignore
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
      blockdb: `++id,&cid,
        &uuid,
        topic,
        kind,
        document.kind,
        timestamp`,
    })

    this.db = db
    this.db.blockdb.hook(
      'creating',
      this.hooks.attachRouter(this.onBlockCreated),
    )
  }

  async initialize(options: {
    withWallet: any
    withWeb3?: any
    withAncon?: any
    withIpfs?: any
    wakuconnect?: any
    enableSync?: any
    documentTypes?: any
    graphql: { resolvers: any }
  }) {

    await this.graphqlService.initialize(options.graphql.resolvers)
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
      this.syncTopic = `/parkydb/1/${options.withWeb3.defaultAddress}-blockdb/cbor`

      this.messagingService = new MessagingService(
        options.withWeb3.provider,
        options.withWeb3.defaultAddress,
      )
    } else {
      this.messagingService = new MessagingService(undefined, '')
    }

    if (options.withAncon) {
      this.anconService = new AnconService(
        options.withAncon.walletconnectProvider,
        //       options.withAncon.pubkey,
        options.withAncon.api,
      )
    }

    if (options.withIpfs) {
      this.ipfsService = new IPFSService(
        options.withIpfs.gateway,
        options.withIpfs.api,
      )
    }
    // options.withWallet.password = undefined
    // @ts-ignore
    const m = await this.messagingService.bootstrap(options.wakuconnect)
    if (options.enableSync && options.withIpfs && options.withWeb3) {
      this.syncPubsubDexie = await this.createTopicPubsub(this.syncTopic, {
        // @ts-ignore
        blockCodec: this.defaultBlockCodec,
        isKeyExchangeChannel: false,
        canPublish: true,
        canSubscribe: false,
        isCRDT: true,
      })

      const startTime = new Date()
      // 7 days/week, 24 hours/day, 60min/hour, 60secs/min, 100ms/sec
      startTime.setTime(startTime.getTime() - 7 * 24 * 60 * 60 * 1000)
      const sync = await this.getTopicStore([this.syncTopic], {
        startTime,
        endTime: new Date(),
      })

      sync.subscribe(async (message: any) => {
        const { payload } = decode(message.payload)

        const block: Block<any> = await this.dagService.decodeBlock(payload.dag)
        const has = await this.get(block.cid.toString(), null)
        if (!has) await this.put(block.cid, block)
      })
    }
    if (options.enableSync && !options.withIpfs && !options.withWeb3) {
      throw new Error(
        'To enable sync needs IPFS and Waku for Web3 service enabled',
      )
    }
    return m
  }

  get defaultBlockCodec() {
    return {
      name: 'cbor',
      code: '0x71',
      encode: async (obj: any) => encode(obj),
      decode: (buffer: any) => decode(buffer),
    }
  }
  async getSyncStore(filter: any) {
    return this.messagingService.subscribeStore([this.syncTopic], filter)
  }

  async getTopicStore(topics: string[], filter: any) {
    return this.messagingService.subscribeStore(topics, filter)
  }

  async putBlock(payload: any, options: any = {}) {
    const block = await this.dagService.build({ ...payload, ...options })
    const has = await this.get(block.cid.toString(), null)
    if (!!has) {
      return { id: block.cid.toString(), model: has }
    } else {
      await this.put(block.cid, block)

      if (this.syncPubsubDexie) {
        setTimeout(async () => {
          this.syncPubsubDexie.publish({
            dag: block.bytes,
          })
        }, 1500)
      }
      return { id: block.cid.toString() }
    }
  }

  async put(key: CID, value: Block<any>) {
    const jsch = await this.jsonschemaService.build(value.value)
    const mj = new MerkleJson()
    const miniSearch = new MiniSearch({
      fields: Object.keys(value.value),
    })

    const uuid = uuidv4()
    await miniSearch.addAllAsync([{ id: key.toString(), ...value.value }])
    return this.db.blockdb.put({
      cid: key.toString(),
      uuid,
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

  /**
   * Create topic handles any topic configuration. Uses ephimeral encryption keys.
   * @param topic
   * @param options
   * @returns
   */
  async createTopicPubsub(topic: string, options: ChannelOptions) {
    if (options.canPublish === null) {
      options.canPublish = true
    }
    if (options.canSubscribe === null) {
      options.canSubscribe = true
    }

    // creates an observable and subscribes to store block creation
    // @ts-ignore
    return this.messagingService.createTopic(topic, options)
  }

  async emitKeyExchangePublicKey(topic: string, options: ChannelOptions) {
    const { pk, pub } = options
    options.canPublish = true
    options.canSubscribe = true
    options.isKeyExchangeChannel = true
    const pubsub = await this.messagingService.createTopic(topic, options)
    return pubsub.onBlockReply$.pipe(
      filter((res: any) => res.decoded.payload.askForEncryptionKey),
      map((req) => {
        pubsub.publish({
          encryptionPublicKey: pub,
        } as any)
        // TODO: Store in datastore or encrypted
        options.canDecrypt = true
        options.encryptionPubKey = pub as any
        return true
      }),
    )
  }

  async requestKeyExchangePublicKey(
    topic: string,
    options: ChannelOptions,
  ): Promise<any> {
    options.canPublish = true
    options.canSubscribe = true
    options.isKeyExchangeChannel = true
    const pubsub = await this.messagingService.createTopic(topic, options)
    pubsub.publish({ askForEncryptionKey: true } as any)

    return pubsub.onBlockReply$.pipe(
      filter((res: any) => !!res.decoded.payload.encryptionPublicKey),
      map((res: any) => {
        return res.decoded.payload.encryptionPublicKey
      }),
    )
  }

  async getWallet(): Promise<any> {
    // await this.keyringController.load(this.db)
    return this.keyringController.keyringController
  }

  get ancon() {
    return this.anconService
  }
  get ipfs() {
    return this.ipfsService
  }

  /**
   * @deprecated Use createTopicPubsub.
   * @param topic
   * @param options
   * @returns
   */
  async createChannelPubsub(topic: string, options: ChannelOptions) {
    const w = await this.getWallet()
    const acct = await w.getAccounts()
    const from = acct[0]

    const h = await w.exportAccount(from)

    const sigkey = Buffer.from(h, 'hex')
    const pubkey = getPublicKey(sigkey)
    // @ts-ignore
    return this.messagingService.createChannel(
      topic,
      { ...options, sigkey: h, encryptionPubKey: hexlify(pubkey) },
      this.onBlockCreated,
    )
  }

  /**
   * @deprecated Will be removed
   * @param topic
   * @param options
   * @returns
   */
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
    // @ts-ignore
    return this.messagingService.aggregate(topic, {
      ...options,
      sigkey: h,
      encryptionPubKey: hexlify(pubkey),
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
  async getBlocksByTableName$(
    tableName: string,
    fn: (table: Table) => () => unknown,
  ) {
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
      db: this,
    } as ServiceContext
    return this.graphqlService.query(ctx, null)
  }
}
