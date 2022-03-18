const toJsonSchema = require('to-json-schema')
import { IDataBuilder } from './IBuilder'
import { IQueryBuilder } from './IQuery'
// @ts-ignore
import { Index, Document } from 'flexsearch'
export class IndexService implements IDataBuilder, IQueryBuilder {
  constructor(private currentIndex?: any) {}
  async load(key: any, data: any): Promise<any> {
    const index = new Document(key, data)
    this.currentIndex = index
  }

  async query(q: any): Promise<any> {
    this.currentIndex.search(q)
  }
  async build(value: object, kvstore: any): Promise<any> {
    return new Promise(function (resolve) {
      const index = new Document({
        document: {
          index: Object.keys(value),
        },
      })

      index.add(value)
      index.export(async (key: any, data: any) => {
        // do the saving as async
        // resolve({ key, data })
        await kvstore.put(key, data)
      })
    })
  }
}
