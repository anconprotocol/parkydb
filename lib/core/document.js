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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const toJsonSchema = require('to-json-schema');
const loki = require('lokijs');
class DocumentService {
    constructor(currentIndex) {
        this.currentIndex = currentIndex;
    }
    load(key, data) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    query(q) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentIndex.search(q);
        });
    }
    build(value, kvstore) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = new loki(null, { persistentMethod: 'memory', env: 'NODE' });
            const table = db.addCollection(value.cid.toString());
            table.insert(value.value);
            return db.serialize();
        });
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.js.map