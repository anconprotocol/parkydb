import initSqlJs from 'sql.js'

export class IndexService {
  async createBlockTypeSchema() {
    const SQL = await initSqlJs({})

    // Create a database
    const db = new SQL.Database()
    // NOTE: You can also use new SQL.Database(data) where
    // data is an Uint8Array representing an SQLite database file

    // Execute a single SQL string that contains multiple statements

    // indexeddb dagblock, relational db block, fulltextblock, timestamp
    let sqlstr =
      "CREATE TABLE test (key text, val blob); \
                  INSERT INTO test VALUES (0, 'foo'); \
                  INSERT INTO test VALUES (1, 'bar');"
    const result = db.run(sqlstr) // Run the query without returning anything
    console.log('result', result)
  }

}
