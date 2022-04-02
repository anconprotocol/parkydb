"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlService = void 0;
var graphql_1 = require("graphql");
var graphql_tag_1 = __importDefault(require("graphql-tag"));
var graphql_compose_json_1 = __importDefault(require("graphql-compose-json"));
var graphql_compose_1 = require("graphql-compose");
var schema_1 = require("@graphql-tools/schema");
var GraphqlService = (function () {
    function GraphqlService() {
    }
    GraphqlService.prototype.query = function (ctx, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var item, schema;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, ctx.db.blockdb.get({ cid: ctx.cid })];
                    case 1:
                        item = _a.sent();
                        schema = new graphql_1.GraphQLSchema(item.schemas.graphqls);
                        if (options && options.customTypeDefinitions && options.customResolvers) {
                            schema = schema_1.makeExecutableSchema({
                                typeDefs: options.customTypeDefinitions,
                                resolvers: options.customResolvers,
                            });
                        }
                        return [2, graphql_1.execute({
                                schema: schema,
                                variableValues: ctx.variables,
                                contextValue: __assign(__assign({}, ctx), { state: item }),
                                document: graphql_tag_1.default(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        ", "\n      "], ["\n        ", "\n      "])), ctx.query),
                            })];
                }
            });
        });
    };
    GraphqlService.prototype.createSchema = function (blockType) {
        graphql_compose_1.schemaComposer.Query.addFields({
            block: {
                type: blockType,
                args: {
                    cid: "String!",
                },
                resolve: function (source, args, context) {
                    return context.state.document;
                },
            },
        });
        return graphql_compose_1.schemaComposer.buildSchema().toConfig();
    };
    GraphqlService.prototype.build = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var typedValue;
            return __generator(this, function (_a) {
                typedValue = graphql_compose_json_1.default('Block', value);
                return [2, this.createSchema(typedValue.getType())];
            });
        });
    };
    return GraphqlService;
}());
exports.GraphqlService = GraphqlService;
var templateObject_1;
//# sourceMappingURL=graphql.js.map