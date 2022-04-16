"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSchema = void 0;
const schema_generator_1 = require("../schema/schema-generator");
async function buildSchema(options) {
    const resolvers = options.resolvers;
    const schema = await schema_generator_1.SchemaGenerator.generateFromMetadata({ ...options, resolvers });
    return schema;
}
exports.buildSchema = buildSchema;
//# sourceMappingURL=buildSchema.js.map