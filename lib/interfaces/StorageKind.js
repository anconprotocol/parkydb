"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC721Block = exports.AnconBlock = exports.AddressBlock = exports.ConfigBlock = exports.IPFSBlock = exports.StorageBlock = exports.StorageAsset = exports.Document = void 0;
const type_graphql_1 = require("type-graphql");
let Document = class Document {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Document.prototype, "kind", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Document.prototype, "tag", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Document.prototype, "ref", void 0);
Document = __decorate([
    type_graphql_1.ObjectType()
], Document);
exports.Document = Document;
let StorageAsset = class StorageAsset extends Document {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StorageAsset.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StorageAsset.prototype, "kind", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], StorageAsset.prototype, "timestamp", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StorageAsset.prototype, "description", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StorageAsset.prototype, "image", void 0);
__decorate([
    type_graphql_1.Field(type => [String]),
    __metadata("design:type", Array)
], StorageAsset.prototype, "sources", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StorageAsset.prototype, "owner", void 0);
StorageAsset = __decorate([
    type_graphql_1.ObjectType()
], StorageAsset);
exports.StorageAsset = StorageAsset;
let StorageBlock = class StorageBlock extends Document {
};
__decorate([
    type_graphql_1.Field(type => StorageAsset),
    __metadata("design:type", StorageAsset)
], StorageBlock.prototype, "content", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StorageBlock.prototype, "signature", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StorageBlock.prototype, "digest", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], StorageBlock.prototype, "timestamp", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], StorageBlock.prototype, "issuer", void 0);
StorageBlock = __decorate([
    type_graphql_1.ObjectType()
], StorageBlock);
exports.StorageBlock = StorageBlock;
let IPFSBlock = class IPFSBlock extends Document {
};
IPFSBlock = __decorate([
    type_graphql_1.ObjectType()
], IPFSBlock);
exports.IPFSBlock = IPFSBlock;
let ConfigBlock = class ConfigBlock extends Document {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ConfigBlock.prototype, "entries", void 0);
ConfigBlock = __decorate([
    type_graphql_1.ObjectType()
], ConfigBlock);
exports.ConfigBlock = ConfigBlock;
let AddressBlock = class AddressBlock extends Document {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], AddressBlock.prototype, "address", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], AddressBlock.prototype, "resolver", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], AddressBlock.prototype, "type", void 0);
AddressBlock = __decorate([
    type_graphql_1.ObjectType()
], AddressBlock);
exports.AddressBlock = AddressBlock;
let AnconBlock = class AnconBlock extends Document {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], AnconBlock.prototype, "cid", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], AnconBlock.prototype, "topic", void 0);
AnconBlock = __decorate([
    type_graphql_1.ObjectType()
], AnconBlock);
exports.AnconBlock = AnconBlock;
let ERC721Block = class ERC721Block extends Document {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ERC721Block.prototype, "txid", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ERC721Block.prototype, "metadata", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ERC721Block.prototype, "tokenAddress", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ERC721Block.prototype, "tokenId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ERC721Block.prototype, "chainId", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ERC721Block.prototype, "minterAddress", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ERC721Block.prototype, "ownerAddress", void 0);
ERC721Block = __decorate([
    type_graphql_1.ObjectType()
], ERC721Block);
exports.ERC721Block = ERC721Block;
//# sourceMappingURL=StorageKind.js.map