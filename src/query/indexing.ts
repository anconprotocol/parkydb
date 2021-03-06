const toJsonSchema = require('to-json-schema')
import { IDataBuilder } from 'parkydb-interfaces'
import { IQueryBuilder } from 'parkydb-interfaces'
export class IndexService implements IDataBuilder, IQueryBuilder {
  constructor(private currentIndex?: any) {}
  async load(key: any, data: any): Promise<any> {}

  async query(q: any): Promise<any> {
    this.currentIndex.search(q)
  }
  async build(value: object, kvstore: any): Promise<any> {}
}
