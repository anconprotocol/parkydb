import { execute, GraphQLObjectType, GraphQLSchema } from 'graphql'
import { IDataBuilder } from '../interfaces/IBuilder'
import { IQueryBuilder } from '../interfaces/IQuery'
import { ServiceContext } from '../interfaces/ServiceContext'
import gql from 'graphql-tag'
import composeWithJson from 'graphql-compose-json'
import { schemaComposer } from 'graphql-compose'
import { SchemaGenerator } from 'type-graphql/dist/schema/schema-generator'
/**
 * GraphQL manages query and mutation operations
 */
export class GraphqlService implements IDataBuilder, IQueryBuilder {
  schema!: GraphQLSchema
  sdl: any

  constructor() {}

  async initialize(resolvers: any) {
    const options = {
      resolvers,
      skipCheck: true,
    }
    const schema = await SchemaGenerator.generateFromMetadata({
      ...options,
      resolvers,
    })
    this.schema = schema

    this.sdl = schemaComposer.merge(this.schema).toSDL()
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

    return schemaComposer.buildSchema().toConfig()
  }

  // @deprecated
  async build(value: object) {
    const typedValue = composeWithJson('Block', value)
    return this.createSchema(typedValue.getType())
  }

  getSDL() {
    return this.sdl
  }
}
