const toJsonSchema = require('to-json-schema')
import { BaseBlockstore, CID } from 'blockstore-core/base'
import { Dexie } from 'dexie'
import initSqlJs from 'sql.js'
import { getGraphQLWriter, getJsonSchemaReader, makeConverter } from 'typeconv'
import { IndexService } from './indexing'

export class DataAgentStore extends BaseBlockstore {
  constructor(private db: Dexie) {
    super()
  }

  async open() {
    const db = new Dexie('ancon')

    db.version(1).stores({
      blockdb: `
        &cid,
        topic`,
    })
    ;(db as any).blockdb.hook('creating', this.createHook)
    this.db = db
  }

  async createHook(pk, obj, tx) {
    // index
    const indexService = new IndexService()
    const indexKV = await indexService.build({
      id: 'cid',
      ...obj,
    })

    // create schemas
    const reader = getJsonSchemaReader()
    const writer = getGraphQLWriter()
    const { convert } = makeConverter(reader, writer)
    const jsch = toJsonSchema(obj)
    const { data } = await convert({
      data: jsch,
    })

    const graphqls = data

    ;(this.db as any).blockdb.put({
      cid: pk,
      index: {
        ...indexKV,
      },
      graphqls,
      jsonschema: jsch,
    })

    // TODO: emit waku pubsub
  }

  async put(key: CID, value: any) {
    ;(this.db as any).blockdb.put({
      cid: key,
      dag: value
    })
  }
  // https://dexie.org/docs/Table/Table.hook('creating')

  // https://github.com/bradleyboy/tuql/blob/master/src/builders/schema.js
  // async put(key, val, options) {
  //   // store a block
  /* layer 1 immutable saves the key and value
  layer 2 transforms json to graph, graph to sqlite and save to dexie block
  // } insert into , first have to create a block schema
  options:(tpic, format)
  */

  async get(key, options) {
    const props = (this.db as any).blockdb.get({ cid: key })
    return props
    // retrieve a block
  }

  async filter() {}
  async dbQuery() {}
  async gqlQuery() {}
}
