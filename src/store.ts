import { BaseBlockstore, CID } from 'blockstore-core/base'
import { Dexie } from 'dexie'
import initSqlJs from 'sql.js'

export class DataAgentStore extends BaseBlockstore {
  constructor(private db: Dexie) {
    super()
  }

  async open() {
    const db = new Dexie('ancon')

    db.version(1).stores({
      store: `
        &key,
        topic`,
    })

    this.db = db
  }

  async put(key: CID, value: any) {}
  // https://dexie.org/docs/Table/Table.hook('creating')

  async createHook(){
    // index 
    // create schemas
    // emit waku pubsub
  }
  // https://github.com/bradleyboy/tuql/blob/master/src/builders/schema.js
  // async put(key, val, options) {
  //   // store a block
  /* layer 1 immutable saves the key and value
  layer 2 transforms json to graph, graph to sqlite and save to dexie block
  // } insert into , first have to create a block schema
  options:(topic, format)
  */1

  async get(key, options) {
    return this
    // retrieve a block
  }

  async filter(){}
  async dbQuery(){}
  async gqlQuery(){}
}
