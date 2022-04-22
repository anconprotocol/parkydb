import { CID } from 'blockstore-core/base';
import { Table } from 'dexie';
import 'dexie-observable/api';
import { Subject } from 'rxjs';
import { BlockValue, KVAdapter } from 'parkydb-interfaces';
export declare function createKVAdapter(): Promise<KVAdapter>;
export declare class IndexedDBAdapter implements KVAdapter {
    private hooks;
    onBlockCreated: Subject<BlockValue>;
    db: any;
    constructor();
    initialize({ name }: any): Promise<void>;
    put(key: CID, value: BlockValue): Promise<any>;
    get(key: any): Promise<any>;
    queryBlocks$(fn: (blocks: Table) => () => unknown): Promise<import("dexie").Observable<unknown>>;
    getBlocksByTableName$(tableName: string, fn: (table: Table) => () => unknown): Promise<import("dexie").Observable<unknown>>;
}
