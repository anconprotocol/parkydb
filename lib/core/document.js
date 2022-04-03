"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const toJsonSchema = require('to-json-schema');
const loki = require('lokijs');
class DocumentService {
    constructor(currentIndex) {
        this.currentIndex = currentIndex;
    }
    async load(key, data) { }
    async query(q) {
        this.currentIndex.search(q);
    }
    async build(value, kvstore) {
        const db = new loki(null, { persistentMethod: 'memory', env: 'NODE' });
        const table = db.addCollection(value.cid.toString());
        table.insert(value.value);
        return db.serialize();
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.js.map