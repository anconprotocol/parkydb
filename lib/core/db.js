"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
global.crypto = crypto;
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
        this.messagingService = new messaging_1.MessagingService();
        this.hooks = new hooks_1.Hooks();
        this.onBlockCreated = new rxjs_1.Subject();
        const db = new dexie_1.default('ancon', {
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
    }
    initialize(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messagingService.bootstrap();
            if (options.withWallet) {
                yield this.load(this.db);
                yield this.createVault(options.withWallet.password, options.withWallet.seed);
            }
            this.db.blockdb.hook('creating', this.hooks.attachRouter(this.onBlockCreated));
        });
    }
    putBlock(payload, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield this.dagService.build(Object.assign(Object.assign({}, payload), options));
            return this.put(block.cid, block);
        });
    }
    put(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsch = yield this.jsonschemaService.build(value.value);
            const mj = new MerkleJson();
            const miniSearch = new minisearch_1.default({
                fields: Object.keys(value.value),
            });
            yield miniSearch.addAllAsync([Object.assign({ id: key.toString() }, value.value)]);
            return this.db.blockdb.put({
                cid: key.toString(),
                dag: value,
                document: value.value,
                schemas: {
                    jsonschema: jsch,
                    graphqls: yield this.graphqlService.build(value.value),
                },
                hashtag: mj.hash(value.value),
                index: JSON.stringify(miniSearch),
                timestamp: new Date().getTime(),
            });
        });
    }
    createTopicPubsub(topic) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.messagingService.createTopic(topic, this.onBlockCreated);
        });
    }
    createChannelPubsub(topic, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const h = yield this.wallet.exportAccount(options.from);
            const sigkey = Buffer.from(h, 'hex');
            const pubkey = js_waku_1.getPublicKey(sigkey);
            return this.messagingService.createChannel(topic, Object.assign(Object.assign({}, options), { sigkey, pubkey }), this.onBlockCreated);
        });
    }
    get(key, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.blockdb.get({ cid: key });
        });
    }
    filter(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const props = this.db.blockdb.get({ cid: options.key });
            return props;
        });
    }
    query(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const ctx = Object.assign(Object.assign({}, options), { db: this.db });
            return this.graphqlService.query(ctx, null);
        });
    }
}
exports.ParkyDB = ParkyDB;
//# sourceMappingURL=db.js.map