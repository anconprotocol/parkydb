"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultResolvers = void 0;
const BlockValueResolver_1 = require("./BlockValueResolver");
const StorageAssetResolver_1 = require("./StorageAssetResolver");
exports.defaultResolvers = [
    BlockValueResolver_1.BlockValueResolver,
    StorageAssetResolver_1.StorageAssetResolver,
];
//# sourceMappingURL=index.js.map