import { GraphQLSchema } from "graphql";
import { SchemaGeneratorOptions } from "../schema/schema-generator";
import { PrintSchemaOptions } from "./emitSchemaDefinitionFile";
import { NonEmptyArray } from "../interfaces/NonEmptyArray";
interface EmitSchemaFileOptions extends Partial<PrintSchemaOptions> {
    path?: string;
}
export interface BuildSchemaOptions extends Omit<SchemaGeneratorOptions, "resolvers"> {
    resolvers: NonEmptyArray<Function> | NonEmptyArray<string>;
    emitSchemaFile?: string | boolean | EmitSchemaFileOptions;
}
export declare function buildSchema(options: BuildSchemaOptions): Promise<GraphQLSchema>;
export {};
