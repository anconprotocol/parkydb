"use strict";
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
const dexie_1 = __importDefault(require("dexie"));
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
class ParkyDB extends controller_1.WalletController {
    constructor() {
        super();
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
            keyring: `&id`,
            blockdb: `
        &cid,
        topic,
        timestamp`,
        });
        this.db = db;
        this.messagingService = new messaging_1.MessagingService(undefined, '', '');
    }
    async initialize(options = { wakuconnect: null }) {
        if (options.withWallet) {
            await this.load(this.db);
            await this.createVault(options.withWallet.password, options.withWallet.seed);
        }
        if (options.withWeb3) {
            this.messagingService = new messaging_1.MessagingService(options.withWeb3.provider, options.withWeb3.pubkey, options.withWeb3.address);
        }
        this.db.blockdb.hook('creating', this.hooks.attachRouter(this.onBlockCreated));
        return this.messagingService.bootstrap(options.wakuconnect);
    }
    async putBlock(payload, options = {}) {
        const block = await this.dagService.build({ ...payload, ...options });
        return this.put(block.cid, block);
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
    async createChannelPubsub(topic, options) {
        const h = await this.wallet.exportAccount(options.from);
        const sigkey = Buffer.from(h, 'hex');
        const pubkey = (0, js_waku_1.getPublicKey)(sigkey);
        return this.messagingService.createChannel(topic, { ...options, sigkey, pubkey }, this.onBlockCreated);
    }
    async get(key, options = {}) {
        return this.db.blockdb.get({ cid: key });
    }
    async filter(options) {
        const props = this.db.blockdb.get({ cid: options.key });
        return props;
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