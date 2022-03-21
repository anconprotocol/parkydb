const fakeIndexedDB = require('fake-indexeddb')
const fakeIDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')
const { getPredefinedBootstrapNodes, Waku, Protocols } = require('js-waku')

import { CID } from 'blockstore-core/base'
import Dexie from 'dexie'
import MiniSearch from 'minisearch'
import { Block } from 'multiformats/block'
import { DAGJsonService } from './dagjson'
import { DocumentService } from './document'
import { GraphqlService } from './graphql'
import { JsonSchemaService } from './jsonschema'
import { ServiceContext } from './ServiceContext'
const toJsonSchema = require('to-json-schema')
const { MerkleJson } = require('merkle-json')

const db: Dexie | any = new Dexie('ancon', {
  indexedDB: fakeIndexedDB,
  IDBKeyRange: fakeIDBKeyRange,
})

db.version(1).stores({
  blockdb: `
    &cid,
    topic,
    timestamp`,
})
// db.blockdb.hook('creating', Hooks.createHook(db))

export class ParkyDB {
  private dagService = new DAGJsonService()
  private documentService = new DocumentService()
  private graphqlService = new GraphqlService()
  private jsonschemaService = new JsonSchemaService()
  waku: any

  constructor() {}
  async initialize() {
    const waku = await Waku.create({ bootstrap: { default: true } })

    // Wait to be connected to at least one peer
    await new Promise((resolve, reject) => {
      // If we are not connected to any peer within 10sec let's just reject
      // As we are not implementing connection management in this example

      setTimeout(reject, 10000)
      waku.libp2p.connectionManager.on('peer:connect', () => {
        resolve(null)
      })
    })
    this.waku = waku
  }
  async putBlock(payload: any) {
    const block = await this.dagService.build(payload)
    return this.put(block.cid, block)
  }
  async put(key: CID, value: Block<any>) {
    const jsch = await this.jsonschemaService.build(value.value)
    const mj = new MerkleJson()
    const miniSearch = new MiniSearch({
      fields: Object.keys(value.value),
    })

    await miniSearch.addAllAsync([{ id: key.toString(), ...value.value }])
    return db.blockdb.put({
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

  async get(key: any, options: any) {
    return db.blockdb.get({ cid: key })
  }

  async filter(options: any) {
    const props = db.blockdb.get({ cid: options.key })
    return props
  }
  async query(options: any) {
    const ctx = {
      ...options,
      db,
    } as ServiceContext
    return this.graphqlService.query(ctx, null)
  }
}
