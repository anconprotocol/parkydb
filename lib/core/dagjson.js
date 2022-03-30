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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAGJsonService = void 0;
const Block = __importStar(require("multiformats/block"));
const codec = __importStar(require("@ipld/dag-json"));
const sha2_1 = require("multiformats/hashes/sha2");
class DAGJsonService {
    build(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let block = yield Block.encode({ value, codec, hasher: sha2_1.sha256 });
            return block;
        });
    }
    loadFromCID(kvstore, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = kvstore.get(key);
            return Block.create({
                bytes: block.bytes,
                cid: block.cid,
                codec,
                hasher: sha2_1.sha256,
            });
        });
    }
    loadFromKey(kvstore, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = kvstore.get(key);
            return Block.decode({ bytes: block.bytes, codec, hasher: sha2_1.sha256 });
        });
    }
}
exports.DAGJsonService = DAGJsonService;
//# sourceMappingURL=dagjson.js.map