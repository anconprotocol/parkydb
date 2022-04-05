"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParkyDB = void 0;
const fakeIndexedDB = require('fake-indexeddb');
const fakeIDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
const { Crypto } = require('@peculiar/webcrypto');
const crypto = new Crypto();
if (!global.window) {
    global.crypto = crypto;
}
const dexie_1 = __importStar(require("dexie"));
require("dexie-observable/api");
const minisearch_1 = __importDefault(require("minisearch"));
const dagjson_1 = require("./dagjson");
const graphql_1 = require("../query/graphql");
const jsonschema_1 = require("./jsonschema");
const messaging_1 = require("./messaging");
const hooks_1 = require("./hooks");
const rxjs_1 = require("rxjs");
const controller_1 = require("../wallet/controller");
const js_waku_1 = require("js-waku");
const { MerkleJson } = require('merkle-json');
class ParkyDB {
    constructor() {
        this.keyringController = new controller_1.WalletController();
        this.dagService = new dagjson_1.DAGJsonService();
        this.graphqlService = new graphql_1.GraphqlService();
        this.jsonschemaService = new jsonschema_1.JsonSchemaService();
        this.hooks = new hooks_1.Hooks();
        this.onBlockCreated = new rxjs_1.Subject();
        const db = new dexie_1.default('ancon', global.window
            ? {}
            : {
                indexedDB: fakeIndexedDB,
                IDBKeyRange: fakeIDBKeyRange,
            });
        db.version(1).stores({
            keyring: `id`,
            blockdb: `
        ++id,
        &cid,
        topic,
        kind,
        timestamp`,
        });
        this.db = db;
        this.messagingService = new messaging_1.MessagingService(undefined, '', '');
    }
    async initialize(options = { wakuconnect: null }) {
        if (options.withWallet) {
            if (options.withWallet.autoLogin) {
                try {
                    await this.keyringController.keyringController.submitPassword(options.withWallet.password);
                    await this.keyringController.load(this.db);
                }
                catch (e) {
                    await this.keyringController.load(this.db);
                    await this.keyringController.createVault(options.withWallet.password, options.withWallet.seed);
                }
            }
        }
        if (options.withWeb3) {
            this.messagingService = new messaging_1.MessagingService(options.withWeb3.provider, options.withWeb3.pubkey, options.withWeb3.address);
        }
        this.db.blockdb.hook('creating', this.hooks.attachRouter(this.onBlockCreated));
        options.withWallet.password = undefined;
        return this.messagingService.bootstrap(options.wakuconnect);
    }
    async putBlock(payload, options = {}) {
        const block = await this.dagService.build({ ...payload, ...options });
        const has = await this.get(block.cid.toString(), null);
        if (!!has) {
            return { id: block.cid.toString(), model: has };
        }
        else {
            await this.put(block.cid, block);
            return { id: block.cid.toString() };
        }
    }
    async put(key, value) {
        const jsch = await this.jsonschemaService.build(value.value);
        const mj = new MerkleJson();
        const miniSearch = new minisearch_1.default({
            fields: Object.keys(value.value),
        });
        await miniSearch.addAllAsync([{ id: key.toString(), ...value.value }]);
        return this.db.blockdb.put({
            cid: key.toString(),
            dag: value,
            document: value.value,
            schemas: {
                jsonschema: jsch,
            },
            hashtag: mj.hash(value.value),
            index: JSON.stringify(miniSearch),
            timestamp: new Date().getTime(),
        });
    }
    async createTopicPubsub(topic) {
        return this.messagingService.createTopic(topic, this.onBlockCreated);
    }
    async getWallet() {
        return this.keyringController.keyringController;
    }
    async createChannelPubsub(topic, options) {
        const w = await this.getWallet();
        const h = await w.exportAccount(options.from);
        const sigkey = Buffer.from(h, 'hex');
        const pubkey = js_waku_1.getPublicKey(sigkey);
        return this.messagingService.createChannel(topic, { ...options, sigkey, pubkey }, this.onBlockCreated);
    }
    async get(key, options = {}) {
        return this.db.blockdb.get({ cid: key });
    }
    async queryBlocks$(fn) {
        return dexie_1.liveQuery(fn(this.db.blockdb));
    }
    async query(options) {
        const ctx = {
            ...options,
            db: this.db,
        };
        return this.graphqlService.query(ctx, null);
    }
}
exports.ParkyDB = ParkyDB;
//# sourceMappingURL=db.js.map