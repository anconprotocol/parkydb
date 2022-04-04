# Ancon ParkyDB 

## A data mesh database using Web 3.0 technology 

>Note: Requires Node v17.7.2 and up for development

More about [data mesh architecture](https://www.datamesh-architecture.com/) 

![ParkyDB (2)](https://user-images.githubusercontent.com/1248071/159067543-a3afb7dd-c3e0-45f8-be96-9ff20083f488.png)

![ParkyDB (1)](https://user-images.githubusercontent.com/1248071/159067544-593fa50f-9125-4266-9b08-c58f44bd7d5c.png)

## Block based data layered abstraction

### IndexedDB (KV Layer - Layer 0)

Stores key as cid or custom (topic) and values in the layered approached with a schema similar to:

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

### DAG  (Linkable and Verifiable Layer - Layer 1)  

Stores as an IPLD Multiformats DAG Block. Input must be a JSON payload. Can support either CBOR or JSON. This layer keeps data immutable (no mutations allowed) and uses special directives with query layer.

### Document (Document Layer - Layer 2) 

Stores as a JSON. Input must be a JSON payload. Used for queries only and represents a snapshot of the immutable data in DAG.

### Index (Query and index Layer - Layer 3)  

Stores as a Minisearch filter index. Input must be JSON payload. Used for search only and represents the JSON payload index, the `@filter` GraphQL directive will enable filtering.

### GraphQL Schema (Query and index Layer - Layer 3)  

Stores a GraphQL Schema. Used with on-demand GraphQL APIs that enables querying the DB and Index layer. Mutations are immutable PUTs in DAG. It also integrates different GraphQL stores using Mesh and appends the data as blocks in the database.

### JSON Schema (Verifiable Document Layer - Layer 4)

Stores a JSON Schema. Used to create `Verifiable Data Document`  dapps which  might contain or required ERC-721 / Verified Credential compatible schemas. This feature is used for data publishing exclusively.

### Protobuf Schema (Messaging Layer - Layer 5)

Stores a Protobuf Schema. Used to integrate data library with Waku and decentralized full nodes


## Run tests

We using Ava test framework

`npm test`


>Note: Enable OpenSSL legacy support.

`export NODE_OPTIONS="--openssl-legacy-provider"`



## API v1.0.0-rc.3

### Store

```typescript
import { ParkyDB } from 'parkydb'

// Instantiate new DB instance
const db = new ParkyDB()
await db.initialize()

// Writes a DAG JSON block
const id = await db.putBlock(payload)

// Fetch an existing DAG block
const res = await db.get(id)
// Queries using Dexie
const obs$ = await db.queryBlocks((blocks) => {
    return () => blocks.where({ cid: '' })
});

// Queries with GraphQL a JSON snapshot of the DAG block
const q = await db.query({
    cid: id,
    query: `
    query{
       block(cid: "${id}") {
         network
         key
       }
    }   
    `,
  })
```


### Topics and Subscriptions

```typescript
import { ParkyDB } from 'parkydb'

// Instantiate new DB instance
const db = new ParkyDB()
// Browsers can only support web sockets connections with Waku v2
const peer =
    '/ip4/0.0.0.0/tcp/8000/wss/p2p/...'
  await this.bob.initialize({
    // wakuconnec options
    wakuconnect: { bootstrap: { peers: [peer] } },
    // Remember these values come from a CLI or UI, DO NOT hardcode when implementing
    withWallet: {
      password: 'zxcvb',
      seed: 'opera offer craft joke defy team prosper tragic reopen street advice moral',
    },
  })
const topic = `/anconprotocol/1/marketplace/ipld-dag-json`

// Writes a DAG JSON block
const id = await db.putBlock({...payload, topic})

// Fetch an existing DAG block
const res = await db.get(id)

const pubsub = await db.createTopicPubsub(topic)

// pubsub methods
//  { 
//   Streams blocks from topic message replies
//   onBlockReply$: pubsub.asObservable(),
//    
//   On demand publishing
//   publish: async (block: BlockValue),
//   
//   Closes any pending subscriptions
//   close: () 
// }

pubsub.onBlockReply$.subscribe((block)=> {

  // GraphQL
  const q = await db.query({
      block,
      query: `
      query{
        block(cid: "${id}") {
          network
          key
        }
      }   
      `,
    })
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



### Protocols (channels)

```typescript
test('create channel topic, signed and encrypted, cbor as message serialization', async (t) => {
  const { alice, bob }: { alice: ParkyDB; bob: ParkyDB } = t.context as any

  await alice.wallet.addSecp256k1([
    'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
  ])
  await alice.wallet.submitPassword(`qwerty`)
  let accounts = await alice.wallet.getAccounts()
  t.is(accounts.length, 1)
  const accountA = accounts[0]

  await bob.wallet.submitPassword(`zxcvb`)
  accounts = await bob.wallet.getAccounts()
  t.is(accounts.length, 1)
  const accountB = accounts[0]

  const blockCodec = {
    name: 'cbor',
    code: '0x71',
    encode: (obj: any) => encode(obj),
    decode: (buffer: any) => decode(buffer),
  }
  const topic = `/anconprotocol/1/marketplace/cbor`
  const pubsubAlice = await alice.createChannelPubsub(topic, {
    from: accountA,
    middleware: {
      incoming: [tap()],
      outgoing: [map((v: BlockValue)=> v.document)],
    },
    blockCodec,
  })
  pubsubAlice.onBlockReply$.subscribe(async (block: WakuMessage) => {
    // match topic
    t.is(topic, JSON.parse(block.payloadAsUtf8).topic)
  })
  const pubsubBob = await bob.createChannelPubsub(topic, {
    from: accountB,
    middleware: {
      incoming: [tap()],
      outgoing: [map((v: BlockValue)=> v.document)],
    },
    blockCodec,
  })
  pubsubBob.onBlockReply$.subscribe(async (block: WakuMessage) => {
    // match topic
    t.is(topic, JSON.parse(block.payloadAsUtf8).topic)
    await bob.putBlock(payload, { topic })
  })

  // Say hi
  await alice.putBlock(payload, { topic })
})
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
  const pubsubAlice = await alice.createChannelPubsub(topicBSC, {
    from: accountA,
    middleware: {
      incoming: [tap()],
      outgoing: [tap()],
    },
    blockCodec,
  })
  const pubsubBob = await bob.createChannelPubsub(topicEthereum, {
    from: accountB,
    middleware: {
      incoming: [tap()],
      outgoing: [tap()],
    },
    blockCodec,
  })
  const pubsubCharlie = await charlie.createChannelPubsub(topicPolygon, {
    from: accountC,
    middleware: {
      incoming: [tap()],
      outgoing: [tap()],
    },
    blockCodec,
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
  const aggregator = await consumer.aggregate(
    [topicBSC, topicEthereum, topicPolygon],
    {
      from: accountConsumer,
      middleware: {
        incoming: [
          filter(
            (v: object) => v.address === '0x...' && v.event === 'Transfer',
          ),
          zip(map(v=>v),reduce((v, init) => (v = new BigNumber(init).add(v)))),
        ],
      },
      blockCodec,
    },
  )

  aggregator.onBlockReply$.subscribe(async (payload: any) => {
    const {v, sum} = payload
    // send to discord or arbitrage bot...
  })
})

```
 
> Copyright IFESA  2022
