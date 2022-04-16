import { CID } from 'multiformats'
import { Block } from 'multiformats/block'
import { Field, ObjectType } from 'type-graphql'
import { Document } from './StorageKind'

export interface Schemas {
  jsonschema: string
  graphqls: string
  ipld?: string
  pb?: string
}

export interface BlockValue {
  cid: CID
  dag: Block<any>
  document: object
  topic?: string
  schemas: Schemas
  index: any
  hashtag: any
  timestamp: number
}

@ObjectType()
export class DBBlockValue {
  @Field()
  cid!: string

  // @Field()
  // dag!: Block<any>

  @Field()
  document!: Document

  @Field()
  topic?: string

  @Field()
  index!: string

  @Field()
  hashtag!: string

  @Field()
  timestamp!: number
}
