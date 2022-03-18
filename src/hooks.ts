import Dexie from 'dexie'
import { Block } from 'multiformats/block'
import { getGraphQLWriter, getJsonSchemaReader, makeConverter } from 'typeconv'
import { IndexService } from './indexing'
const toJsonSchema = require('to-json-schema')

export class Hooks {
  static createHook(db: Dexie | any) {
    return async (pk: string, obj: any, tx: any) => {
      // // index
      // const indexService = new IndexService()
      // const indexKV =  await indexService.build({
      //   id: 'cid',
      //   ...obj.dag.value,
      // }, db.indexes)


//      console.log(indexKV)
      // create schemas
      const reader = getJsonSchemaReader()
      const writer = getGraphQLWriter()
      const { convert } = makeConverter(reader, writer)
      const jsch = toJsonSchema(obj.dag.value)
      const { data } = await convert({
        data: jsch,
      })

      const graphqls = data

      obj.graphqls = graphqls;
      obj.jsonschema =  jsch;

      await db.blockdb.put(obj);
      return obj;
      // TODO: emit waku pubsub
    }
  }
}
