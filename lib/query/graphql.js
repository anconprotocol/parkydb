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
exports.GraphqlService = void 0;
const graphql_1 = require("graphql");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const graphql_compose_json_1 = __importDefault(require("graphql-compose-json"));
const graphql_compose_1 = require("graphql-compose");
const schema_1 = require("@graphql-tools/schema");
class GraphqlService {
    query(ctx, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield ctx.db.blockdb.get({ cid: ctx.cid });
            let schema = new graphql_1.GraphQLSchema(item.schemas.graphqls);
            if (options && options.customTypeDefinitions && options.customResolvers) {
                schema = schema_1.makeExecutableSchema({
                    typeDefs: options.customTypeDefinitions,
                    resolvers: options.customResolvers,
                });
            }
            return graphql_1.execute({
                schema,
                variableValues: ctx.variables,
                contextValue: Object.assign(Object.assign({}, ctx), { state: item }),
                document: graphql_tag_1.default `
        ${ctx.query}
      `,
            });
        });
    }
    createSchema(blockType) {
        graphql_compose_1.schemaComposer.Query.addFields({
            block: {
                type: blockType,
                args: {
                    cid: `String!`,
                },
                resolve: (source, args, context) => context.state.document,
            },
        });
        return graphql_compose_1.schemaComposer.buildSchema().toConfig();
    }
    build(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const typedValue = graphql_compose_json_1.default('Block', value);
            return this.createSchema(typedValue.getType());
        });
    }
}
exports.GraphqlService = GraphqlService;
//# sourceMappingURL=graphql.js.map