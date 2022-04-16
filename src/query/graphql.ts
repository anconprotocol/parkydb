import {
  execute,
  GraphQLObjectType,
  GraphQLSchema,
  Source,
} from 'graphql'
import { IDataBuilder } from '../interfaces/IBuilder'
import { IQueryBuilder } from '../interfaces/IQuery'
import { ServiceContext } from '../interfaces/ServiceContext'
import gql from 'graphql-tag'
import composeWithJson from 'graphql-compose-json'
import { schemaComposer } from 'graphql-compose'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { buildSchema } from 'type-graphql'
/**
 * GraphQL manages query and mutation operations
 */
export class GraphqlService implements IDataBuilder, IQueryBuilder {
  schema!: GraphQLSchema
  
  constructor(){}

  async initialize(resolvers: any) {
    this.schema = await buildSchema({
      resolvers,
      skipCheck: true
    })
  }
  async query(ctx: ServiceContext, options: any = {}): Promise<any> {
    return execute({
      schema: this.schema,
      variableValues: ctx.variables,
      contextValue: {
        ...ctx,
      },
      document: gql`
        ${ctx.query}
      `,
    })
  }


  // @deprecated
  createSchema(blockType: GraphQLObjectType<any, any>) {
    schemaComposer.Query.addFields({
      block: {
        type: blockType,
        args: {
          cid: `String!`,
          //filter: 'String',
        },
        resolve: (source: any, args: any, context: ServiceContext) =>
          context.state.document,
      },
    })

    return (schemaComposer.buildSchema().toConfig())
  }

  // @deprecated
  async build(value: object) {
    const typedValue = composeWithJson('Block', value)
    return this.createSchema(typedValue.getType())
  }
}
