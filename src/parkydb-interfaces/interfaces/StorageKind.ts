import {} from 'class-validator'
import { Field, InterfaceType, ObjectType } from 'type-graphql'

@ObjectType()
export class Document {
  @Field()
  kind!: string

  @Field()
  tag!: string

  @Field()
  ref!: string
}

// Metadata asset - Store locally
@ObjectType()
export class StorageAsset extends Document{
  @Field()
  name!: string

  @Field()
  kind!: string

  @Field()
  timestamp!: number

  @Field()
  description!: string

  @Field()
  image!: string

  @Field(type => [String])
  sources!: string[]

  @Field()
  owner!: string
}

@ObjectType()
export class StorageBlock extends Document{
  @Field(type => StorageAsset)
  content!: StorageAsset
  @Field()
  signature!: string // Either Waku+Web3 EIP712 or eth_signMessage
  @Field()
  digest!: string
  @Field()
  timestamp!: number
  @Field()
  issuer!: string
}

@ObjectType()
export class IPFSBlock extends Document{
  cid!: string
}

@ObjectType()
export class ConfigBlock extends Document{
  @Field()
  entries!: string
}

@ObjectType()
export class AddressBlock extends Document{
  @Field()
  address!: string

  @Field()
  resolver!: string

  @Field()
  type!:
    | 'erc20'
    | 'erc721'
    | 'smart contract'
    | 'eoa'
    | 'uri'
    | 'phone'
    | 'email'
    | 'gps'
    | 'did'
    | 'ens'
}

@ObjectType()
export class AnconBlock extends Document{
  @Field()
  cid!: string
  @Field()
  topic!: string
}

@ObjectType()
export class ERC721Block extends Document{
  @Field()
  txid!: string
  @Field()
  metadata!: string
  @Field()
  tokenAddress!: string
  @Field()
  tokenId!: string
  @Field()
  chainId!: string
  @Field()
  minterAddress!: string
  @Field()
  ownerAddress!: string
}
