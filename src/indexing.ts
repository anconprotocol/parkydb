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
  async build(value: object) {
    const index = new Document({
      document: {
        index: Object.keys(value),
      },
    })

    index.add(value)
// @ts-ignore
    const res = await index.export(function (key, data) {
      return new Promise(function (resolve) {
        // do the saving as async

        resolve({ key, data })
      })
    })

    return res
  }
}
