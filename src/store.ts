const fakeIndexedDB = require('fake-indexeddb')
const fakeIDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')

import { BaseBlockstore, CID } from 'blockstore-core/base'
import Dexie from 'dexie'
import MiniSearch from 'minisearch'
import { Block } from 'multiformats/block'
import { DAGJsonService } from './dagjson'
import { DocumentService } from './document'
import { GraphqlService } from './graphql'
import { JsonSchemaService } from './jsonschema'
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

  constructor() {}
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
        graphqls: this.graphqlService.defaultTypeDefinitions,
      },
      hashtag: mj.hash(value.value),
      index: JSON.stringify(miniSearch),
    })
  }

  // https://github.com/bradleyboy/tuql/blob/master/src/builders/schema.js
  // async put(key, val, options) {
  //   // store a block
  /* layer 1 immutable saves the key and value
  layer 2 transforms json to graph, graph to sqlite and save to dexie block
  // } insert into , first have to create a block schema
  options:(tpic, format)
  */

  // @ts-ignore
  async get(key, options) {
    return db.blockdb.get({ cid: key })
  }
  // @ts-ignore
  async filter(key, options) {
    const props = db.blockdb.get({ cid: key })
    return props
  }
  async query(key: any, options: any) {
    const props = db.blockdb.get({ cid: key })
    const ctx = {
      ...options,
    }
    const res = await this.graphqlService.query(ctx, props);
    return res
  }
}
