"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedDBAdapter = exports.createKVAdapter = void 0;
const fakeIndexedDB = require('fake-indexeddb');
const fakeIDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
const dexie_1 = __importStar(require("dexie"));
require("dexie-observable/api");
const hooks_1 = require("./hooks");
const rxjs_1 = require("rxjs");
async function createKVAdapter() {
    const a = new IndexedDBAdapter();
    await a.initialize({ name: '' });
    return a;
}
exports.createKVAdapter = createKVAdapter;
class IndexedDBAdapter {
    constructor() {
        this.hooks = new hooks_1.Hooks();
        this.onBlockCreated = new rxjs_1.Subject();
    }
    async initialize({ name }) {
        const db = new dexie_1.default(name, global.window
            ? {}
            : {
                indexedDB: fakeIndexedDB,
                IDBKeyRange: fakeIDBKeyRange,
            });
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
        });
        this.db = db;
        this.db.blockdb.hook('creating', this.hooks.attachRouter(this.onBlockCreated));
    }
    async put(key, value) {
        return this.db.blockdb.put({ ...value });
    }
    async get(key) {
        return this.db.blockdb.get({ cid: key });
    }
    async queryBlocks$(fn) {
        return (0, dexie_1.liveQuery)(fn(this.db.blockdb));
    }
    async getBlocksByTableName$(tableName, fn) {
        return (0, dexie_1.liveQuery)(fn(this.db[tableName]));
    }
}
exports.IndexedDBAdapter = IndexedDBAdapter;
//# sourceMappingURL=idb.js.map