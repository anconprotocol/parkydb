import { GraphQLObjectType } from 'graphql';
import { IDataBuilder } from '../interfaces/IBuilder';
import { IQueryBuilder } from '../interfaces/IQuery';
import { ServiceContext } from '../interfaces/ServiceContext';
export declare class GraphqlService implements IDataBuilder, IQueryBuilder {
    query(ctx: ServiceContext, options?: any): Promise<any>;
    createSchema(blockType: GraphQLObjectType<any, any>): import("graphql/type/schema").GraphQLSchemaNormalizedConfig;
    build(value: object): Promise<import("graphql/type/schema").GraphQLSchemaNormalizedConfig>;
}
