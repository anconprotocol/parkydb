import { BlockValue } from './interfaces/blockvalue'
import {
  buildSchema,
  DocumentNode,
  GraphQLSchema,
  parse,
  printSchema,
} from 'graphql'
import { processRequest } from 'graphql-helix'
import { makeExecutableSchema } from 'graphql-tools'
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json'
import { IDataBuilder } from './interfaces/IBuilder'
import { IQueryBuilder } from './interfaces/IQuery'
import { Resolvers } from './resolvers-types'

interface ResolverContext {
  block: BlockValue
}
interface ServiceContext {
  request: any
  variables: string | { [name: string]: any } | undefined
  operationName: string | undefined
  query: string | DocumentNode | undefined
}
export class GraphqlService implements IDataBuilder, IQueryBuilder {
  private currentSchema: GraphQLSchema = makeExecutableSchema({
    typeDefs: this.defaultTypeDefinitions,
    resolvers: this.defaultResolvers,
  })
  async query(
    ctx: ServiceContext,
    data: BlockValue,
    options?: any,
  ): Promise<any> {
    let schema = this.currentSchema

    if (options.customTypeDefinitions && options.customResolvers) {
      schema = makeExecutableSchema({
        typeDefs: this.defaultTypeDefinitions,
        resolvers: this.defaultResolvers,
      })
    }

    return processRequest({
      operationName: ctx.operationName,
      query: ctx.query,
      variables: ctx.variables,
      request: ctx.request,
      schema,
      contextFactory: () => ({
        block: data,
      }),
    })
  }

  get defaultTypeDefinitions() {
    return `
    type Query {
      blocks: [JSON]
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
        blocks: (root, args, context) => {},
      },
      Mutation: {
        put: () => {}
      }
    }
    return resolvers
  }
  async build(value: object) {
    // const blockType = composeWithJson('Block', value).toSDL()
    return `
    scalar JSON
    scalar JSONObject
    
    type Query {
        blocks: [JSON]
    }
    
    type Mutation {
        put: JSON
    }
  `
  }
}
