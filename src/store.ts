const fakeIndexedDB = require('fake-indexeddb')
const fakeIDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')

import { BaseBlockstore, CID } from 'blockstore-core/base'
import Dexie from 'dexie'
import MiniSearch from 'minisearch'
import { Block } from 'multiformats/block'
import { getGraphQLWriter, getJsonSchemaReader, makeConverter } from 'typeconv'
import { DocumentService } from './db'
const toJsonSchema = require('to-json-schema')
const { MerkleJson } = require('merkle-json')

const db: Dexie | any = new Dexie('ancon', {
  indexedDB: fakeIndexedDB,
  IDBKeyRange: fakeIDBKeyRange,
})

db.version(1).stores({
  blockdb: `
    &cid,
    topic`,
})
// db.blockdb.hook('creating', Hooks.createHook(db))

export class DataAgentStore {
  async put(key: CID, value: Block<any>) {
    const reader = getJsonSchemaReader()
    const writer = getGraphQLWriter()
    const { convert } = makeConverter(reader, writer)
    const jsch = toJsonSchema(value.value)
    const { data } = await convert({
      data: jsch,
    })
    const mj = new MerkleJson()
    const graphqls = data

    const miniSearch = new MiniSearch({
      fields: Object.keys(value.value),
    })

    const documentService = new DocumentService()

    await miniSearch.addAllAsync([{ id: key.toString(), ...value.value }])
    return db.blockdb.put({
      cid: key.toString(),
      dag: value,
      document: await documentService.build(value),
      schemas: {
        jsonschema: jsch,
        graphqls,
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
  // @ts-ignore
  async dbQuery(key, options) {
    const props = db.blockdb.get({ cid: key })
    return props
  }
  // @ts-ignore
  async gqlQuery(key, options) {
    const props = db.blockdb.get({ cid: key })
    return props
  }
}
