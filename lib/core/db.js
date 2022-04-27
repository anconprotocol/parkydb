"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParkyDB = void 0;
const { Crypto } = require('@peculiar/webcrypto');
const crypto = new Crypto();
if (!global.window) {
    global.crypto = crypto;
}
const cbor_x_1 = require("cbor-x");
const rxjs_1 = require("rxjs");
const uuid_1 = require("uuid");
const graphql_1 = require("../query/graphql");
const controller_1 = require("../wallet/controller");
const ancon_1 = require("./ancon");
const dagjson_1 = require("./dagjson");
const ipfs_1 = require("./ipfs");
const jsonschema_1 = require("./jsonschema");
const messaging_1 = require("./messaging");
const { MerkleJson } = require('merkle-json');
class ParkyDB {
    constructor(name) {
        this.name = name;
        this.keyringController = new controller_1.WalletController();
        this.dagService = new dagjson_1.DAGJsonService();
        this.graphqlService = new graphql_1.GraphqlService();
        this.jsonschemaService = new jsonschema_1.JsonSchemaService();
        this.syncTopic = '';
    }
    async initialize(options) {
        this.db = new options.withDB.provider();
        await this.db.initialize(options.withDB.options);
        await this.graphqlService.initialize(options.graphql.resolvers);
        if (options.withWallet) {
            await this.keyringController.load(this.db.db);
            if (options.withWallet.autoLogin) {
                try {
                    const kr = await this.keyringController.keyringController.submitPassword(options.withWallet.password);
                }
                catch (e) {
                    await this.keyringController.createVault(options.withWallet.password, options.withWallet.seed);
                }
            }
        }
        if (options.withWeb3) {
            this.syncTopic = `/parkydb/1/${options.withWeb3.defaultAddress}-blockdb/cbor`;
            this.messagingService = new messaging_1.MessagingService(options.withWeb3.provider, options.withWeb3.defaultAddress);
        }
        else {
            this.messagingService = new messaging_1.MessagingService(undefined, '');
        }
        if (options.withAncon) {
            this.anconService = new ancon_1.AnconService(options.withAncon.walletconnectProvider, options.withAncon.api);
        }
        if (options.withIpfs) {
            this.ipfsService = new ipfs_1.IPFSService(options.withIpfs.gateway, options.withIpfs.api);
        }
        const m = await this.messagingService.bootstrap(options.wakuconnect);
        if (options.enableSync && options.withIpfs && options.withWeb3) {
            this.syncPubsubDexie = await this.createTopicPubsub(this.syncTopic, {
                blockCodec: this.defaultBlockCodec,
                isKeyExchangeChannel: false,
                canPublish: true,
                canSubscribe: false,
                isCRDT: true,
            });
            const startTime = new Date();
            startTime.setTime(startTime.getTime() - 7 * 24 * 60 * 60 * 1000);
            const sync = await this.getTopicStore([this.syncTopic], {
                startTime,
                endTime: new Date(),
            });
            sync.subscribe(async (message) => {
                const { payload } = (0, cbor_x_1.decode)(message.payload);
                const block = await this.dagService.decodeBlock(payload.dag);
                const has = await this.get(block.cid.toString(), null);
                if (!has)
                    await this.put(block.cid, block);
            });
        }
        if (options.enableSync && !options.withIpfs && !options.withWeb3) {
            throw new Error('To enable sync needs IPFS and Waku for Web3 service enabled');
        }
        return m;
    }
    get defaultBlockCodec() {
        return {
            name: 'cbor',
            code: '0x71',
            encode: async (obj) => (0, cbor_x_1.encode)(obj),
            decode: (buffer) => (0, cbor_x_1.decode)(buffer),
        };
    }
    async getSyncStore(filter) {
        return this.messagingService.subscribeStore([this.syncTopic], filter);
    }
    async getTopicStore(topics, filter) {
        return this.messagingService.subscribeStore(topics, filter);
    }
    async putBlock(payload, options = {}) {
        const block = await this.dagService.build({ ...payload, ...options });
        const has = await this.get(block.cid.toString(), null);
        if (!!has) {
            return { id: block.cid.toString(), model: has };
        }
        else {
            await this.put(block.cid, block);
            if (this.syncPubsubDexie) {
                setTimeout(async () => {
                    this.syncPubsubDexie.publish({
                        dag: block.bytes,
                    });
                }, 1500);
            }
            return { id: block.cid.toString() };
        }
    }
    async put(key, value, path = []) {
        const uuid = (0, uuid_1.v4)();
        return this.db.put(key, {
            cid: key.toString(),
            uuid,
            dag: value,
            document: value.value,
            timestamp: new Date().getTime(),
        }, path);
    }
    async createTopicPubsub(topic, options) {
        if (options.canPublish === null) {
            options.canPublish = true;
        }
        if (options.canSubscribe === null) {
            options.canSubscribe = true;
        }
        return this.messagingService.createTopic(topic, options);
    }
    async emitKeyExchangePublicKey(topic, options) {
        const { pk, pub } = options;
        options.canPublish = true;
        options.canSubscribe = true;
        options.isKeyExchangeChannel = true;
        const pubsub = await this.messagingService.createTopic(topic, options);
        return pubsub.onBlockReply$.pipe((0, rxjs_1.filter)((res) => res.decoded.payload.askForEncryptionKey), (0, rxjs_1.map)((req) => {
            pubsub.publish({
                encryptionPublicKey: pub,
            });
            options.canDecrypt = true;
            options.encryptionPubKey = pub;
            return true;
        }));
    }
    async requestKeyExchangePublicKey(topic, options) {
        options.canPublish = true;
        options.canSubscribe = true;
        options.isKeyExchangeChannel = true;
        const pubsub = await this.messagingService.createTopic(topic, options);
        pubsub.publish({ askForEncryptionKey: true });
        return pubsub.onBlockReply$.pipe((0, rxjs_1.filter)((res) => !!res.decoded.payload.encryptionPublicKey), (0, rxjs_1.map)((res) => {
            return res.decoded.payload.encryptionPublicKey;
        }));
    }
    async getWallet() {
        return this.keyringController.keyringController;
    }
    get ancon() {
        return this.anconService;
    }
    get ipfs() {
        return this.ipfsService;
    }
    async get(key, path = []) {
        return this.db.get(key, path);
    }
    async queryBlocks$(fn) {
        return this.db.queryBlocks$(fn);
    }
    async getBlocksByTableName$(tableName, fn) {
        return this.db.getBlocksByTableName$(tableName, fn);
    }
    async query(options) {
        const ctx = {
            ...options,
            db: this,
        };
        return this.graphqlService.query(ctx, null);
    }
    get graphqlSchema() {
        return this.graphqlService.getSDL();
    }
}
exports.ParkyDB = ParkyDB;
//# sourceMappingURL=db.js.map