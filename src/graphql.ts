import { BlockValue } from './interfaces/blockvalue'
import {
  buildSchema,
  execute,
  GraphQLSchema,
  parse,
  printSchema,
} from 'graphql'
import { GraphQLClient } from 'graphql-request'
import { makeExecutableSchema } from 'graphql-tools'
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'
import { IDataBuilder } from './interfaces/IBuilder'
import { IQueryBuilder } from './interfaces/IQuery'
import { Resolvers } from './resolvers-types'
import { ServiceContext } from './ServiceContext'
import gql from 'graphql-tag'

export class GraphqlService implements IDataBuilder, IQueryBuilder {
  private currentSchema: GraphQLSchema = makeExecutableSchema({
    typeDefs: this.defaultTypeDefinitions,
    resolvers: this.defaultResolvers,
  })
  async query(ctx: ServiceContext, options: any = {}): Promise<any> {
    let schema = this.currentSchema

    if (options && options.customTypeDefinitions && options.customResolvers) {
      schema = makeExecutableSchema({
        typeDefs: this.defaultTypeDefinitions,
        resolvers: this.defaultResolvers,
      })
    }

    return execute({
      schema,
      variableValues: ctx.variables,
      contextValue: ctx,
      document: gql`
        ${ctx.query}
      `,
    })
  }

  get defaultTypeDefinitions() {
    return `
    scalar JSON
    scalar JSONObject
    
    type Query {
        block(key: String): JSONObject
    }
    
    type Mutation {
        put: JSON
    }
  `
  }

  get defaultResolvers() {
    const resolvers: Resolvers = {
      JSON: GraphQLJSON,
      JSONObject: GraphQLJSONObject,
      Query: {
        // @ts-ignore
        block: async (root: any, args: any, context: ServiceContext) => {
          // @ts-ignore
          const { document } = await context.db.blockdb.get({ cid: args.key })

          return document
        },
      },
      Mutation: {
        put: () => {},
      },
    }
    return resolvers
  }
  async build(value: object) {
    return this.defaultTypeDefinitions
  }
}
