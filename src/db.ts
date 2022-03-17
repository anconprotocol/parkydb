const toJsonSchema = require('to-json-schema')
import initSqlJs from 'sql.js'

import { connect } from 'trilogy'
import {
  getJsonSchemaReader,
  getTypeScriptWriter,
  makeConverter,
} from 'typeconv'
import { IQueryBuilder } from './IQuery'

export class DBService implements IQueryBuilder {
  async query(value: object) {
    const jsch = toJsonSchema(value)
    const reader = getJsonSchemaReader()
    const writer = getTypeScriptWriter()
    const { convert } = makeConverter(reader, writer)
    const { data } = await convert({
      data: jsch,
    })

    // set the filename to ':memory:' for fast, in-memory storage
    const db = connect(':memory:', {
      // it works for both clients above!
      client: 'sql.js',
    })

    const blocks = await db.model('blocks', data as any)

    await blocks.create(value)

    return blocks
  }
}
