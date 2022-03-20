import {
  execute,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import { IDataBuilder } from './interfaces/IBuilder'
import { IQueryBuilder } from './interfaces/IQuery'
import { ServiceContext } from './ServiceContext'
import gql from 'graphql-tag'
import composeWithJson from 'graphql-compose-json'
import { schemaComposer } from 'graphql-compose'

export class GraphqlService implements IDataBuilder, IQueryBuilder {
  async query(ctx: ServiceContext, options: any = {}): Promise<any> {
    // @ts-ignore
    const item = await ctx.db.blockdb.get({ cid: ctx.cid })
    let schema = new GraphQLSchema(item.schemas.graphqls)

    if (options && options.customTypeDefinitions && options.customResolvers) {
      schema = makeExecutableSchema({
        typeDefs: options.customTypeDefinitions,
        resolvers: options.customResolvers,
      })
    }

    return execute({
      schema,
      variableValues: ctx.variables,
      contextValue: {
        ...ctx,
        state: item,
      },
      document: gql`
        ${ctx.query}
      `,
    })
  }


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

    return schemaComposer.buildSchema().toConfig()
  }
  async build(value: object) {
    const typedValue = composeWithJson('Block', value)
    return this.createSchema(typedValue.getType())
  }
}
