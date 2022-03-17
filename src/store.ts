const setGlobalVars = require('indexeddbshim')
// @ts-ignore
global.window = global // We'll allow ourselves to use `window.indexedDB` or `indexedDB` as a global
setGlobalVars(global  , { checkOrigin: false }) // See signature below

import { BaseBlockstore, CID } from 'blockstore-core/base'
import Dexie from 'dexie'

import { Hooks } from './hooks'

const db: Dexie | any = new Dexie('ancon', { indexedDB: global.indexedDB })

db.version(1).stores({
  blockdb: `
    &cid,
    topic`,
})
db.blockdb.hook('creating', Hooks.createHook(db))

export class DataAgentStore {
  async put(key: CID, value: any) {
    return db.blockdb.put({
      cid: key.toString(),
      dag: value,
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
    const props = db.blockdb.get({ cid: key })
    return props
    // retrieve a block
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
