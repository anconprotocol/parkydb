# Ancon ParkyDB 

## A data mesh database using Web 3.0 technology 

```npm i parkydb```

```Note: Requires Node v18 and up for development```

More about [data mesh architecture](https://www.datamesh-architecture.com/) 

## Block based data layered abstraction

### KV Layer - Layer 0

Stores key as cid and value as block:

```
{
   "key": "cid",
   "dag": ...blob...,
   "db": ...blob...,
   "index:": ...blob...,
   "gqls": ...blob...,
   "jsonschema": ...blob...
}
```

### Linkable and Verifiable Layer - Layer 1

Stores as an IPLD Multiformats DAG Block. Input must be a JSON payload. Can support either CBOR or JSON. This layer keeps data immutable (no mutations allowed) and uses special directives with query layer.

### Document Layer - Layer 2

Stores as a JSON. Input must be a JSON payload. Used for queries only and represents a snapshot of the immutable data in DAG.

### Query and index Layer - Layer 3

Stores as a Minisearch filter index. Input must be JSON payload. Used for search only and represents the JSON payload index, the `@filter` GraphQL directive will enable filtering. Add GraphQL support using Typegraphql to query the document layer.



## Run tests

We using Ava test framework

`npm test`


>Note: Enable OpenSSL legacy support.

`export NODE_OPTIONS="--openssl-legacy-provider"`



## API v1.1.0

### Store

```typescript
import { ParkyDB } from 'parkydb'

// Instantiate new DB instance
const db = new ParkyDB('northwind')
await db.initialize()

// Writes a DAG JSON block
const id = await db.putBlock(payload)

// Gets block from KV layer
const res = await db.get(id)

// Queries using document layer
const obs$ = await db.queryBlocks((blocks) => {
    return () => blocks.where({ cid: '' })
});

// Queries with GraphQL
const q = await db.query({
    query: `
    query{
       block(cid: "${id}") {
         network
         key
       }
    }   
    `,
  })

// Query direct to the document layer
db.getBlocksByTableName$('blockdb', (b) => {
      return () =>
        b.where({ 'document.kind': 'StorageAsset' }).limit(limit).toArray()
    })
```

### GraphQL

#### Create type definitions

```typescript
// StorageKind.ts
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

```


#### Create resolver

```typescript
// StorageAssetResolver.ts
import 'reflect-metadata'

import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  Int,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql'
import { ParkyDB } from '../core/db'
import { ServiceContext } from '../interfaces/ServiceContext'
import { StorageAsset } from '../interfaces/StorageKind'

@ArgsType()
class StorageAssetArgs {
  @Field((type) => Int, { defaultValue: 10, nullable: true })
  limit!: number
}

@Resolver()
export class StorageAssetResolver {

  @Query((returns) => StorageAsset)
  async asset(@Arg('id') id: string, @Ctx() ctx: ServiceContext) {
    const model = await ctx.db.get(id)
    if (model === undefined) {
      throw new Error('Not found ' + id)
    }
    return model
  }

  @Query((returns) => [StorageAsset])
  async assets(
    @Args() { limit }: StorageAssetArgs,
    @Ctx() ctx: ServiceContext,
  ) {
    return ctx.db.getBlocksByTableName$('blockdb', (b) => {
      return () =>
        b.where({ 'document.kind': 'StorageAsset' }).limit(limit).toArray()
    })
  }
}

```

### Create a resolvers index file

```typescript
// index.ts
import { BlockValueResolver } from './BlockValueResolver'
import { StorageAssetResolver } from './StorageAssetResolver'

export const defaultResolvers = [
  BlockValueResolver,
  StorageAssetResolver,
] as const


```

#### Load into ParkyDB

```typescript
await this.db.initialize({
  graphql: { resolvers: defaultResolvers }, 
  enableSync: true,
  wakuconnect: {
    bootstrap: { peers: [peer] },
  },
  withWallet: {
    password: '', /// Not used
  },
  withWeb3: {
    provider: web3provider,
    defaultAddress: identity.address,
  },       
  withIpfs: {
    gateway: 'https://ipfs.infura.io',
    api: 'https://ipfs.infura.io:5001',
  },
})
```

#### Query

```typescript
  const q = await db.query({
    query: `
    query{
      block(cid: "${id}"){
        cid,
        document{
          kind
        }
      }
    }   
    `,
  })

  t.is(q.data.block.cid, 'baguqeerabve7ug2qddskk3mpomdt3xdnhvh53jvmca7qh43p36y5hfoassoq')
```


### Topics and Subscriptions

```typescript
import { ParkyDB } from 'parkydb'

// Instantiate new DB instance
const db = new ParkyDB('data-union')
// Browsers can only support web sockets connections with Waku v2
const peer =
    '/ip4/0.0.0.0/tcp/8000/wss/p2p/...'

  // typegraphql resolvers
  await this.db.initialize({
          graphql: { resolvers: defaultResolvers }, 
          enableSync: true,
          wakuconnect: {
            bootstrap: { peers: [peer] },
          },
          withWallet: {
            password: '', /// Not used
          },
          withWeb3: {
            provider: web3provider,
            defaultAddress: identity.address,
          },       
          withIpfs: {
            gateway: 'https://ipfs.infura.io',
            api: 'https://ipfs.infura.io:5001',
          },
        })
const topic = `/anconprotocol/1/marketplace/ipld-dag-json`

// Writes a DAG JSON block
const id = await db.putBlock({...payload, topic})

// Fetch an existing DAG block
const res = await db.get(id)

// ============================================
// Create a key exchange and encrypted topic
// ============================================
// Keys
const ecdsa = EthCrypto.createIdentity()

// Subscriber codec
const receiverCodec = {
  name: 'cbor',
  code: '0x71',
  encode: async (obj) => encode(obj),
  decode: async (buffer) => {
    const cipher = await EthCrypto.cipher.parse(decode(buffer))

    const plain = await EthCrypto.decryptWithPrivateKey(
      ecdsa.privateKey,
      cipher
    )

    return JSON.parse(plain)
  },
}

// Main topic
const pubsub = await this.db.createTopicPubsub(this.defaultTopic, {
  blockCodec: receiverCodec,
  canSubscribe: true,
  isKeyExchangeChannel: false,
  canPublish: true,
  isCRDT: false,
})
      
pubsub.onBlockReply$.subscribe(async (v) => {
  // custom logic
  await this.db.putBlock(v.decoded.payload)
})

// default block codec
const blockCodec = {
  name: 'cbor',
  code: '0x71',
  encode: async (obj) => encode(obj),
  decode: (buffer) => decode(buffer),
}


// emits key exchange public key
await this.db.emitKeyExchangePublicKey(
  this.keyExchangeTopic,
  {
    blockCodec,
    // disables user signing requests when isCRDT is set to false
    isCRDT: false,
    pk: w.privateKey,
    pub: w.publicKey,
  }
))

// requests key exchange public key
const kex = await this.db.requestKeyExchangePublicKey(
  `/parkydb/1/keyex/cbor`,
  {
    blockCodec,
  }
)
// obtains encryption public key
const sub = kex.subscribe(async (encryptionPubKey: any) => {
  const encBlockCodec = {
    name: 'cbor',
    code: '0x71',
    encode: async (obj) => {
      const enc = await EthCrypto.encryptWithPublicKey(
        encryptionPubKey,
        JSON.stringify(obj)
      )

      const x = await EthCrypto.cipher.stringify(enc)
      return encode(x)
    },
  }

  // custom logic, create another topic or convert observable to promise
})
```


### Wallet

```typescript
import { ParkyDB } from 'parkydb'

// Instantiate new DB instance
const db = new ParkyDB()
await db.initialize({
  // withWeb3 for interactive usage, eg browsers, smart phones.
  withWeb3: {
    provider: ethers.providers.Web3Provider(windows.ethereum),
    pubkey,
    pubkeySig,
    defaultAddress,
  },
  // withWallet useful for backend use cases (eg NestJS)
  // Remember these values come from a environment variables, CLI or UI, DO NOT hardcode when implementing
  withWallet: {
    password: '',
    // Note: Invented this mnemonic rap, 12 words, as my way to protest #WARINUKRAINE
    seed: 'lumber brown jack house bomb cluster star method guard against war peace',
  }
})

// Where `db.wallet` is metamask keyring controller. See https://github.com/MetaMask/KeyringController
// ParkyDB has an Ed22519 implementation for DID and HPKE use cases
await db.wallet.addNewKeyring('Ed25519', [
  'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
])

// Wallet is used internally or by setting options to specific usage. See Protocols for how to encrypt and sign.
```



### WebAuthn

```typescript
import { WebauthnHardwareClient } from 'parkydb/lib/core/webauthnClient'
import { WebauthnHardwareAuthenticate } from 'parkydb/lib/core/webauthnServer'


const model = await this.db.get(cid, null)

// Fido2 server settings
const fido2server = new WebauthnHardwareAuthenticate()
fido2server.initialize({
  rpId: 'localhost',
  rpName: 'du.',
  rpIcon: '',
  attestation: 'none',
  authenticatorRequireResidentKey: false,
  authenticatorUserVerification: 'required',
})

// Fido2 client settings
const fido2client = new WebauthnHardwareClient(fido2server, this.db)
const origin = window.location.origin
const res = await fido2client.registerSign(
  origin,
  model.cid,
  this.defaultAddress(),
  model.dag.bytes
  (args) => { 
     const {
      // publicKey as Uint8Array    
      publicKey,
      // publicKey as JWK
      publicKeyJwk,
      // previous counter
      prevCounter,
      // authenticator data
      authnrData,
      // client data JSON
      clientData,
    } = args
  },
  keepSigning: false
)
```

#### DeFi example

```typescript
test('find multichain tx by sender', async (t) => {
  const {
    alice,
    bob,
    charlie,
    consumer,
  }: {
    alice: ParkyDB
    bob: ParkyDB
    charlie: ParkyDB
    consumer: ParkyDB
  } = t.context as any

  await alice.wallet.submitPassword(`qwerty`)
  let accounts = await alice.wallet.getAccounts()
  const accountA = accounts[0]

  await bob.wallet.submitPassword(`zxcvb`)
  accounts = await bob.wallet.getAccounts()
  const accountB = accounts[0]

  await charlie.wallet.submitPassword(`a1d2f3f4`)
  accounts = await charlie.wallet.getAccounts()
  const accountC = accounts[0]

  await consumer.wallet.submitPassword(`mknjbhvgv`)
  accounts = await consumer.wallet.getAccounts()
  const accountConsumer = accounts[0]

  const blockCodec = {
    name: 'eth-block',
    code: '0x90',
    encode: (obj: any) => encodeDagEth(obj),
    decode: (buffer: any) => decodeDagEth(buffer),
  }

  const topicBSC = `/bsc/1/new_blocks/dageth`
  const topicEthereum = `/ethereum/1/new_blocks/dageth`
  const topicPolygon = `/polygon/1/new_blocks/dageth`

  // Aggregate from BSC, Ethereum and Polygon any Transfer to x address
  // Then pipe calls to Discord channel and an arbitrage bot using a webhook (POST)
  const pubsubAlice = await alice.createTopicPubsub(topicBSC, {
    from: accountA,
    middleware: {
      incoming: [tap()],
      outgoing: [tap()],
    },
    blockCodec,
    canSubscribe: true,
    canPublish: true,
    isCRDT: false,
  })
  const pubsubBob = await bob.createTopicPubsub(topicEthereum, {
    from: accountB,
    middleware: {
      incoming: [tap()],
      outgoing: [tap()],
    },
    blockCodec,
    canSubscribe: true,
    canPublish: true,
    isCRDT: false,
  })
  const pubsubCharlie = await charlie.createTopicPubsub(topicPolygon, {
    from: accountC,
    middleware: {
      incoming: [tap()],
      outgoing: [tap()],
    },
    blockCodec,
    canSubscribe: true,
    canPublish: true,
    isCRDT: false,
  })

  subscribeNewBlocks(
    [
      {
        name: 'bsc',
        chainId: '56',
        rpc: 'wss://somerpc.server',
      },
    ],
    (payload: any) => {
      await alice.putBlock(payload, { topic })
    },
  )

  subscribeNewBlocks(
    [
      {
        name: 'mainnet',
        chainId: '1',
        rpc: 'wss://somerpc.server',
      },
    ],
    (payload: any) => {
      await bob.putBlock(payload, { topic })
    },
  )
  subscribeNewBlocks(
    [
      {
        name: 'polygon',
        chainId: '137',
        rpc: 'wss://somerpc.server',
      },
    ],
    (payload: any) => {
      await charlie.putBlock(payload, { topic })
    },
  )
})

```
 
> Copyright IFESA  2022
