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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageAssetResolver = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const StorageKind_1 = require("../interfaces/StorageKind");
let StorageAssetArgs = class StorageAssetArgs {
};
__decorate([
    type_graphql_1.Field((type) => type_graphql_1.Int, { defaultValue: 10, nullable: true }),
    __metadata("design:type", Number)
], StorageAssetArgs.prototype, "limit", void 0);
StorageAssetArgs = __decorate([
    type_graphql_1.ArgsType()
], StorageAssetArgs);
let StorageAssetResolver = class StorageAssetResolver {
    async asset(id, ctx) {
        const model = await ctx.db.get(id);
        if (model === undefined) {
            throw new Error('Not found ' + id);
        }
        return model;
    }
    async assets({ limit }, ctx) {
        return ctx.db.getBlocksByTableName$('blockdb', (b) => {
            return () => b.where({ 'document.kind': 'StorageAsset' }).limit(limit).toArray();
        });
    }
};
__decorate([
    type_graphql_1.Query((returns) => StorageKind_1.StorageAsset),
    __param(0, type_graphql_1.Arg('id')), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StorageAssetResolver.prototype, "asset", null);
__decorate([
    type_graphql_1.Query((returns) => [StorageKind_1.StorageAsset]),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StorageAssetArgs, Object]),
    __metadata("design:returntype", Promise)
], StorageAssetResolver.prototype, "assets", null);
StorageAssetResolver = __decorate([
    type_graphql_1.Resolver()
], StorageAssetResolver);
exports.StorageAssetResolver = StorageAssetResolver;
//# sourceMappingURL=StorageAssetResolver.js.map