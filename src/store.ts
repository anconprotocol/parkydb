const setGlobalVars = require('indexeddbshim')
// @ts-ignore
global.window = global // We'll allow ourselves to use `window.indexedDB` or `indexedDB` as a global
setGlobalVars(global, { checkOrigin: false }) // See signature below

import { BaseBlockstore, CID } from 'blockstore-core/base'
import Dexie from 'dexie'
import MiniSearch from 'minisearch'
import { Block } from 'multiformats/block'
import { getGraphQLWriter, getJsonSchemaReader, makeConverter } from 'typeconv'
import { IndexService } from './indexing'
const toJsonSchema = require('to-json-schema')
const { MerkleJson } = require('merkle-json')

const db: Dexie | any = new Dexie('ancon', { indexedDB: global.indexedDB })

db.version(1).stores({
  indexes: '++id',
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

    await miniSearch.addAllAsync([{ id: key.toString(), ...value.value }])
    return db.blockdb.put({
      cid: key.toString(),
      dag: value,
      jsonschema: jsch,
      graphqls,
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
