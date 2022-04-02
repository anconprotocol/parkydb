"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParkyDB = void 0;
var fakeIndexedDB = require('fake-indexeddb');
var fakeIDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
var Crypto = require('@peculiar/webcrypto').Crypto;
var crypto = new Crypto();
global.crypto = crypto;
var dexie_1 = __importDefault(require("dexie"));
require("dexie-observable/api");
var minisearch_1 = __importDefault(require("minisearch"));
var dagjson_1 = require("./dagjson");
var graphql_1 = require("../query/graphql");
var jsonschema_1 = require("./jsonschema");
var messaging_1 = require("./messaging");
var hooks_1 = require("./hooks");
var rxjs_1 = require("rxjs");
var controller_1 = require("../wallet/controller");
var main_1 = require("js-waku/build/main");
var MerkleJson = require('merkle-json').MerkleJson;
var ParkyDB = (function (_super) {
    __extends(ParkyDB, _super);
    function ParkyDB() {
        var _this = _super.call(this) || this;
        _this.dagService = new dagjson_1.DAGJsonService();
        _this.graphqlService = new graphql_1.GraphqlService();
        _this.jsonschemaService = new jsonschema_1.JsonSchemaService();
        _this.messagingService = new messaging_1.MessagingService();
        _this.hooks = new hooks_1.Hooks();
        _this.onBlockCreated = new rxjs_1.Subject();
        var db = new dexie_1.default('ancon', {
            indexedDB: fakeIndexedDB,
            IDBKeyRange: fakeIDBKeyRange,
        });
        db.version(1).stores({
            keyring: "&id",
            blockdb: "\n        &cid,\n        topic,\n        timestamp",
        });
        _this.db = db;
        return _this;
    }
    ParkyDB.prototype.initialize = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.messagingService.bootstrap()];
                    case 1:
                        _a.sent();
                        if (!options.withWallet) return [3, 4];
                        return [4, this.load(this.db)];
                    case 2:
                        _a.sent();
                        return [4, this.createVault(options.withWallet.password, options.withWallet.seed)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.db.blockdb.hook('creating', this.hooks.attachRouter(this.onBlockCreated));
                        return [2];
                }
            });
        });
    };
    ParkyDB.prototype.putBlock = function (payload, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.dagService.build(__assign(__assign({}, payload), options))];
                    case 1:
                        block = _a.sent();
                        return [2, this.put(block.cid, block)];
                }
            });
        });
    };
    ParkyDB.prototype.put = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var jsch, mj, miniSearch, _a, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4, this.jsonschemaService.build(value.value)];
                    case 1:
                        jsch = _e.sent();
                        mj = new MerkleJson();
                        miniSearch = new minisearch_1.default({
                            fields: Object.keys(value.value),
                        });
                        return [4, miniSearch.addAllAsync([__assign({ id: key.toString() }, value.value)])];
                    case 2:
                        _e.sent();
                        _b = (_a = this.db.blockdb).put;
                        _c = {
                            cid: key.toString(),
                            dag: value,
                            document: value.value
                        };
                        _d = {
                            jsonschema: jsch
                        };
                        return [4, this.graphqlService.build(value.value)];
                    case 3: return [2, _b.apply(_a, [(_c.schemas = (_d.graphqls = _e.sent(),
                                _d),
                                _c.hashtag = mj.hash(value.value),
                                _c.index = JSON.stringify(miniSearch),
                                _c.timestamp = new Date().getTime(),
                                _c)])];
                }
            });
        });
    };
    ParkyDB.prototype.createTopicPubsub = function (topic) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.messagingService.createTopic(topic, this.onBlockCreated)];
            });
        });
    };
    ParkyDB.prototype.createChannelPubsub = function (topic, options) {
        return __awaiter(this, void 0, void 0, function () {
            var h, sigkey, pubkey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.wallet.exportAccount(options.from)];
                    case 1:
                        h = _a.sent();
                        sigkey = Buffer.from(h, 'hex');
                        pubkey = main_1.getPublicKey(sigkey);
                        return [2, this.messagingService.createChannel(topic, __assign(__assign({}, options), { sigkey: sigkey, pubkey: pubkey }), this.onBlockCreated)];
                }
            });
        });
    };
    ParkyDB.prototype.get = function (key, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.db.blockdb.get({ cid: key })];
            });
        });
    };
    ParkyDB.prototype.filter = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var props;
            return __generator(this, function (_a) {
                props = this.db.blockdb.get({ cid: options.key });
                return [2, props];
            });
        });
    };
    ParkyDB.prototype.query = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var ctx;
            return __generator(this, function (_a) {
                ctx = __assign(__assign({}, options), { db: this.db });
                return [2, this.graphqlService.query(ctx, null)];
            });
        });
    };
    return ParkyDB;
}(controller_1.WalletController));
exports.ParkyDB = ParkyDB;
//# sourceMappingURL=db.js.map