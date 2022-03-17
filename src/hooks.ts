import Dexie from 'dexie'
import { getGraphQLWriter, getJsonSchemaReader, makeConverter } from 'typeconv'
import { IndexService } from './indexing'
const toJsonSchema = require('to-json-schema')

export class Hooks {
  static createHook(db: Dexie | any) {
    return async (pk: string, obj: any, tx: any) => {
        console.log(pk, obj, tx)
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

      db.blockdb.put({
        cid: pk,
        index: {
          ...indexKV,
        },
        graphqls,
        jsonschema: jsch,
      })

      // TODO: emit waku pubsub
    }
  }
}
