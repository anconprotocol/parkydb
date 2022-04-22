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
  cid: string
  dag: Block<any>
  document: object
  uuid: string
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
  timestamp!: number
}
