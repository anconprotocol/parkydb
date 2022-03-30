"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonSchemaService = void 0;
const toJsonSchema = require('to-json-schema');
class JsonSchemaService {
    async build(value) {
        return toJsonSchema(value);
    }
}
exports.JsonSchemaService = JsonSchemaService;
//# sourceMappingURL=jsonschema.js.map