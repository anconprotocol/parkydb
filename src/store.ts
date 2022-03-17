import { BaseBlockstore } from 'blockstore-core/base'
import { Dexie } from 'dexie'
import initSqlJs from 'sql.js'

export class DataAgentStore extends BaseBlockstore {
  constructor(private db: Dexie) {
    super();
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
  // https://dexie.org/docs/Table/Table.hook('creating')
  // https://github.com/bradleyboy/tuql/blob/master/src/builders/schema.js
  // async put(key, val, options) {
  //   // store a block
  /* layer 1 immutable saves the key and value
  layer 2 transforms json to graph, graph to sqlite and save to dexie block
  // } insert into , first have to create a block schema
  options:(topic, format)

  // async get(key, options) {
  //   // retrieve a block
  // } 
  /* Select by key and the value must be json parse

  */

  // ...etc

  /*
  {
    "foo": "bar"
    "bar": "foo"
  } */
}
