import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { IDataBuilder } from '../interfaces/IBuilder';
import { IQueryBuilder } from '../interfaces/IQuery';
import { ServiceContext } from '../interfaces/ServiceContext';
export declare class GraphqlService implements IDataBuilder, IQueryBuilder {
    schema: GraphQLSchema;
    sdl: any;
    constructor();
    initialize(resolvers: any): Promise<void>;
    query(ctx: ServiceContext, options?: any): Promise<any>;
    createSchema(blockType: GraphQLObjectType<any, any>): import("graphql").GraphQLSchemaConfig & {
        types: import("graphql").GraphQLNamedType[];
        directives: import("graphql").GraphQLDirective[];
        extensions: import("graphql/jsutils/Maybe").Maybe<Readonly<import("graphql").GraphQLSchemaExtensions>>;
        extensionASTNodes: readonly import("graphql").SchemaExtensionNode[];
        assumeValid: boolean;
    };
    build(value: object): Promise<import("graphql").GraphQLSchemaConfig & {
        types: import("graphql").GraphQLNamedType[];
        directives: import("graphql").GraphQLDirective[];
        extensions: import("graphql/jsutils/Maybe").Maybe<Readonly<import("graphql").GraphQLSchemaExtensions>>;
        extensionASTNodes: readonly import("graphql").SchemaExtensionNode[];
        assumeValid: boolean;
    }>;
    getSDL(): any;
}
