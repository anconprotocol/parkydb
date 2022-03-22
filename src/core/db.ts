const fakeIndexedDB = require('fake-indexeddb')
const fakeIDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')
const { getPredefinedBootstrapNodes, Waku, Protocols } = require('js-waku')

import { CID } from 'blockstore-core/base'
import Dexie from 'dexie'
import MiniSearch from 'minisearch'
import { Block } from 'multiformats/block'
import { DAGJsonService } from './dagjson'
import { DocumentService } from './document'
import { GraphqlService } from '../query/graphql'
import { JsonSchemaService } from './jsonschema'
import { ServiceContext } from '../interfaces/ServiceContext'
import { MessagingService } from './messaging'
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

/**
 * ParkyDB core class
 */
export class ParkyDB {
  private dagService = new DAGJsonService()
  private documentService = new DocumentService()
  private graphqlService = new GraphqlService()
  private jsonschemaService = new JsonSchemaService()
  private messagingService = new MessagingService();

  constructor() {}
  async initialize() {
    
    this.messagingService.bootstrap();
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
