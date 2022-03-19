import Dexie from 'dexie'
import { Block } from 'multiformats/block'
import { getGraphQLWriter, getJsonSchemaReader, makeConverter } from 'typeconv'
import { IndexService } from './indexing'
const toJsonSchema = require('to-json-schema')

export class Hooks {
  static createHook(db: Dexie | any) {
    return async (pk: string, obj: any, tx: any) => {}
  }
}
