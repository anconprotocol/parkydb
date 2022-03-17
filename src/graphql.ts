const toJsonSchema = require('to-json-schema')
import { IDataBuilder } from './IBuilder'
import { IQueryBuilder } from './IQuery'

export class GraphqlService implements IDataBuilder, IQueryBuilder {
  async query(data: any): Promise<any> {
    throw new Error('Method not implemented.')
  }
  async build(value: object) {
    return toJsonSchema(value)
  }
}
