const toJsonSchema = require('to-json-schema')
const loki = require('lokijs')
import { Block } from 'multiformats/block'
import { IDataBuilder } from '../interfaces/IBuilder'
import { IQueryBuilder } from '../interfaces/IQuery'
export class DocumentService implements IDataBuilder, IQueryBuilder {
  constructor(private currentIndex?: any) {}
  async load(key: any, data: any): Promise<any> {}

  async query(q: any): Promise<any> {
    this.currentIndex.search(q)
  }
  async build(value: Block<any>, kvstore?: any): Promise<any> {
    const db = new loki(null, { persistentMethod: 'memory', env: 'NODE' })                
    const table = db.addCollection(value.cid.toString())
    table.insert(value.value)
    return db.serialize()
  }
}
