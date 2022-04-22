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
const schema_generator_1 = require("type-graphql/dist/schema/schema-generator");
class GraphqlService {
    constructor() { }
    async initialize(resolvers) {
        const options = {
            resolvers,
            skipCheck: true,
        };
        const schema = await schema_generator_1.SchemaGenerator.generateFromMetadata({
            ...options,
            resolvers,
        });
        this.schema = schema;
        this.sdl = graphql_compose_1.schemaComposer.merge(this.schema).toSDL();
    }
    async query(ctx, options = {}) {
        return (0, graphql_1.execute)({
            schema: this.schema,
            variableValues: ctx.variables,
            contextValue: {
                ...ctx,
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
        return graphql_compose_1.schemaComposer.buildSchema().toConfig();
    }
    async build(value) {
        const typedValue = (0, graphql_compose_json_1.default)('Block', value);
        return this.createSchema(typedValue.getType());
    }
    getSDL() {
        return this.sdl;
    }
}
exports.GraphqlService = GraphqlService;
//# sourceMappingURL=graphql.js.map