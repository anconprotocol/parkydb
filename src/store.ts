import { BaseBlockstore } from "blockstore-core/base";
import initSqlJs from "sql.js";

export class DataAgentStore extends BaseBlockstore {
  async createBlockTypeSchema() {
    const SQL = await initSqlJs({});

    // Create a database
    const db = new SQL.Database();
    // NOTE: You can also use new SQL.Database(data) where
    // data is an Uint8Array representing an SQLite database file

    // Execute a single SQL string that contains multiple statements

    // indexeddb dagblock, relational db block, fulltextblock, timestamp
    let sqlstr =
      "CREATE TABLE test (key text, val blob); \
                  INSERT INTO test VALUES (0, 'foo'); \
                  INSERT INTO test VALUES (1, 'bar');";
    const result = db.run(sqlstr); // Run the query without returning anything
    console.log("result", result);
  }
  async open() {}
  // bootstraping dexie.js 
  // dexie table will have 2 fields(key, value) 


  // async close() {} as nice to have

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
