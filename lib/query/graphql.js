"use strict";
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
    async query(ctx, options = {}) {
        const item = await ctx.db.blockdb.get({ cid: ctx.cid });
        const config = await this.build(item.document);
        let schema = new graphql_1.GraphQLSchema(config);
        if (options && options.customTypeDefinitions && options.customResolvers) {
            schema = (0, schema_1.makeExecutableSchema)({
                typeDefs: options.customTypeDefinitions,
                resolvers: options.customResolvers,
            });
        }
        return (0, graphql_1.execute)({
            schema,
            variableValues: ctx.variables,
            contextValue: {
                ...ctx,
                state: item,
            },
            document: (0, graphql_tag_1.default) `
        ${ctx.query}
      `,
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
        return (graphql_compose_1.schemaComposer.buildSchema().toConfig());
    }
    async build(value) {
        const typedValue = (0, graphql_compose_json_1.default)('Block', value);
        return this.createSchema(typedValue.getType());
    }
}
exports.GraphqlService = GraphqlService;
//# sourceMappingURL=graphql.js.map