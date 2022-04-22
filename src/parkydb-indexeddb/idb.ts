const fakeIndexedDB = require('fake-indexeddb')
const fakeIDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')

import { CID } from 'blockstore-core/base'
import Dexie, { liveQuery, Table } from 'dexie'
import 'dexie-observable/api'

import { Hooks } from './hooks'
import { Subject } from 'rxjs'
import { BlockValue } from '../parkydb-interfaces'
import { KVAdapter } from '../parkydb-interfaces/interfaces/KVAdapter'

export async function createKVAdapter():  Promise<KVAdapter> {
  const a = new IndexedDBAdapter()
  await a.initialize({ name: '' })
  return a
}

/**
 * IndexedDBAdapter core class
 */
export class IndexedDBAdapter implements KVAdapter {
  private hooks = new Hooks()
  onBlockCreated = new Subject<BlockValue>()
  db: any
  constructor(){}

  async initialize({ name }: any) {
    const db: Dexie | any = new Dexie(
      name,
      // @ts-ignore
      global.window
        ? {}
        : {
            indexedDB: fakeIndexedDB,
            IDBKeyRange: fakeIDBKeyRange,
          },
    )

    db.version(1).stores({
      fido2keys: `++id,rawId`,
      keyring: `id`,
      history: `&cid, refs`,
      blockdb: `++id,&cid,
        &uuid,
        topic,
        kind,
        document.kind,
        timestamp`,
    })

    this.db = db
    this.db.blockdb.hook(
      'creating',
      this.hooks.attachRouter(this.onBlockCreated),
    )
  }

  async put(key: CID, value: BlockValue) {
    return this.db.blockdb.put({ ...value })
  }

  /**
   *
   * @param key
   * @param options
   * @returns
   */
  async get(key: any) {
    return this.db.blockdb.get({ cid: key })
  }

  /**
   *
   * @param options
   * @returns
   */
  async queryBlocks$(fn: (blocks: Table) => () => unknown) {
    return liveQuery(fn(this.db.blockdb))
  }

  /**
   *
   * @param options
   * @returns
   */
  async getBlocksByTableName$(
    tableName: string,
    fn: (table: Table) => () => unknown,
  ) {
    return liveQuery(fn(this.db[tableName]))
  }
}
