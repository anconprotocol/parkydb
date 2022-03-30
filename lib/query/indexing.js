"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexService = void 0;
const toJsonSchema = require('to-json-schema');
class IndexService {
    constructor(currentIndex) {
        this.currentIndex = currentIndex;
    }
    async load(key, data) { }
    async query(q) {
        this.currentIndex.search(q);
    }
    async build(value, kvstore) { }
}
exports.IndexService = IndexService;
//# sourceMappingURL=indexing.js.map