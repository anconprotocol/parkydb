      import { decode, encode } from 'cbor-x'
import test from 'ava'
import { WakuMessage } from 'js-waku'
import { ByteView } from 'multiformats/codecs/interface'
import { map, tap } from 'rxjs'
import { BlockValue } from 'parkydb-interfaces'
import { ParkyDB } from './db'
import { MessagingService } from './messaging'
import { Simple } from '../wallet/simple'
import { defaultResolvers } from '../resolvers'
import { IndexedDBAdapter } from '../parkydb-indexeddb'

const payload = {
  commitHash: 'xg8pyBr3McqYlUgxAqV0t3s6TRcP+B7MHyPTtyVKMJw=',
  contentHash: {
    '/': 'baguqeerahiqryfzwbjc2fn7is4k2uupilwtoxabtb6noifnwxznxszuvrg6a',
  },
  digest: '0x5ab3124ede7a511fbc7c6302b164d1547aefda8b5909b6bb637c7da025c3ffaf',
  height: 207,
  issuer: '0x32A21c1bB6E7C20F547e930b53dAC57f42cd25F6',
  key:
    'YW5jb25wcm90b2NvbC91c2Vycy9kaWQ6ZXRocjpibmJ0OjB4MzJBMjFjMWJCNkU3QzIwRjU0N2U5MzBiNTNkQUM1N2Y0MmNkMjVGNi9iYWd1cWVlcmFoaXFyeWZ6d2JqYzJmbjdpczRrMnV1cGlsd3RveGFidGI2bm9pZm53eHpueHN6dXZyZzZh',
  lastBlockHash: {
    '/': 'baguqeeraw4ssfjictj2b47cccep2oioytbjistjke2xuaa35qgdoivtgrwra',
  },
  network: 'anconprotocol',
  parentHash: {
    '/': 'baguqeerakv6jersryhhanjaihmb2ncdujajxt7gpkfzs7rkur7lo4s5uecwa',
  },
  rootKey:
    'YW5jb25wcm90b2NvbC91c2Vycy9kaWQ6ZXRocjpibmJ0OjB4MzJBMjFjMWJCNkU3QzIwRjU0N2U5MzBiNTNkQUM1N2Y0MmNkMjVGNg==',
  signature:
    '0xa628e3e256a187453c55ffbebc189ec4464c6c0d874a278272d224dbbaa4f6f028d3550651c33edf7af0ea8b3f3806d09ba9135034a61dd1a651c67f83cb06a51b',
  timestamp: 1645384767,
  content: {
    blockchainTokenId: '8',
    blockchainTxHash:
      '0x977dd680952c4f7da1040d12a0a2c9e68a60f6158edee20b1591f91372030670',
    creator: '0x32A21c1bB6E7C20F547e930b53dAC57f42cd25F6',
    currentOrderHash: '',
    description: 'me and friends',
    fileExtension: 'jpg',
    image: 'baguqeerar56ywt7p3qbbf6wiqgja5ybvkblz4wx37vyybthr2jl65d657jha',
    name: 'Sweden 90s',
    owner: '0x32A21c1bB6E7C20F547e930b53dAC57f42cd25F6',
    price: '',
    sources: [
      'https://tensta.did.pa/v0/file/baguqeerar56ywt7p3qbbf6wiqgja5ybvkblz4wx37vyybthr2jl65d657jha/',
    ],
    tags: 'Diseño grafico',
    uuid: '854198e4-1c09-4c27-8103-2ae54adfc681',
  },
}

test.beforeEach(async (t) => {
  const alice = new ParkyDB('tests')
  await alice.initialize({
    graphql: { resolvers: defaultResolvers},
    // Remember these values come from a CLI or UI, DO NOT hardcode when implementing
    withWallet: {
      autoLogin: true,
      password: 'qwerty',
      seed:
        'window alpha view text barely urge minute nasty motion curtain need dinosaur',
    },
    withDB:{
      provider: IndexedDBAdapter,

      options: {
        name:'coco'
      }
    },  })

  const bob = alice

  t.context = {
    db: alice,
    alice,
    bob,
  }
})

test('add key ring', async (t) => {
  const { alice }: { alice: ParkyDB } = t.context as any

  // await db.addNewKeyring('HD Key Tree', [
  //   'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
  // ])
  const aw = await alice.getWallet()
  await aw.submitPassword(`qwerty`)
  // await db.getWallet().submitPassword(`qwerty`)
  const kr = await aw.addNewKeyring(Simple.type, [
    'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
  ])
  const accounts = await aw.getAccounts()

  t.is(accounts.length, 1)
})

test('create topic', async (t) => {
  const { alice, bob }: { alice: ParkyDB; bob: ParkyDB } = t.context as any

  // @ts-ignore
  const aw = await alice.getWallet()
  await aw.submitPassword(`qwerty`)

  await aw.addNewKeyring(Simple.type, [
    'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
  ])

  let accounts = await aw.getAccounts()
  t.is(accounts.length, 1)
  const accountA = accounts[0]

  // @ts-ignore
  const bw = await bob.getWallet()
  await bw.submitPassword(`qwerty`)
  await bw.addNewKeyring(Simple.type, [
    'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d1',
  ])

  accounts = await bw.getAccounts()
  t.is(accounts.length, 1)
  const accountB = accounts[1]

  const blockCodec = {
    name: 'cbor',
    code: '0x71',
    encode: (obj: any) => encode(obj),
    decode: (buffer: any) => decode(buffer),
  }
  const topic = `/anconprotocol/1/marketplace/ipld-dag-json`
  const pubsubAlice = await alice.createTopicPubsub(topic,{
    middleware: {
      incoming: [tap()],
      outgoing: [map((v: BlockValue) => v.document)],
    },
    blockCodec,
  })
  pubsubAlice?.onBlockReply$.subscribe(async (block: WakuMessage) => {
    // match topic
    t.is(topic, JSON.parse(block.payloadAsUtf8).topic)
  })
  
  const pubsubBob = await bob.createTopicPubsub(topic, {
    middleware: {
      incoming: [tap()],
      outgoing: [map((v: BlockValue) => v.document)],
    },
    blockCodec,
  })
  pubsubBob?.onBlockReply$.subscribe(async (block: WakuMessage) => {
    // match topic
    t.is(topic, JSON.parse(block.payloadAsUtf8).topic)
    await bob.putBlock(payload, { topic })
  })

  // Say hi
  await alice.putBlock(payload, { topic })
})

test('create channel topic', async (t) => {
  const { alice, bob }: { alice: ParkyDB; bob: ParkyDB } = t.context as any

  // @ts-ignore
  const aw = await alice.getWallet()
  await aw.submitPassword(`qwerty`)

  await aw.addNewKeyring(Simple.type, [
    'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
  ])

  let accounts = await aw.getAccounts()
  t.is(accounts.length, 1)
  const accountA = accounts[0]

  // @ts-ignore
  const bw = await bob.getWallet()
  await bw.submitPassword(`qwerty`)
  await bw.addNewKeyring(Simple.type, [
    'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d1',
  ])
  accounts = await bw.getAccounts()
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
      outgoing: [map((v: BlockValue) => v.document)],
    },
    blockCodec,
  })
  pubsubAlice?.onBlockReply$.subscribe(async (block: WakuMessage) => {
    // match topic
    t.is(topic, JSON.parse(block.payloadAsUtf8).topic)
  })
  const pubsubBob = await bob.createChannelPubsub(topic, {
    from: accountB,
    middleware: {
      incoming: [tap()],
      outgoing: [map((v: BlockValue) => v.document)],
    },
    blockCodec,
  })
  pubsubBob?.onBlockReply$.subscribe(async (block: WakuMessage) => {
    // match topic
    t.is(topic, JSON.parse(block.payloadAsUtf8).topic)
    await bob.putBlock(payload, { topic })
  })

  // Say hi
  await alice.putBlock(payload, { topic })
})

// test('find multichain tx by sender', async (t) => {
//   const {
//     alice,
//     bob,
//     charlie,
//     consumer,
//   }: {
//     alice: ParkyDB
//     bob: ParkyDB
//     charlie: ParkyDB
//     consumer: ParkyDB
//   } = t.context as any

//   await alice.getWallet().submitPassword(`qwerty`)
//   let accounts = await alice.getWallet().getAccounts()
//   const accountA = accounts[0]

//   await bob.getWallet().submitPassword(`zxcvb`)
//   accounts = await bob.getWallet().getAccounts()
//   const accountB = accounts[0]

//   await charlie.getWallet().submitPassword(`a1d2f3f4`)
//   accounts = await charlie.getWallet().getAccounts()
//   const accountC = accounts[0]

//   await consumer.getWallet().submitPassword(`mknjbhvgv`)
//   accounts = await consumer.getWallet().getAccounts()
//   const accountConsumer = accounts[0]

//   const blockCodec = {
//     name: 'eth-block',
//     code: '0x90',
//     encode: (obj: any) => encodeDagEth(obj),
//     decode: (buffer: any) => decodeDagEth(buffer),
//   }

//   const topicBSC = `/bsc/1/new_blocks/dageth`
//   const topicEthereum = `/ethereum/1/new_blocks/dageth`
//   const topicPolygon = `/polygon/1/new_blocks/dageth`

//   // Aggregate from BSC, Ethereum and Polygon any Transfer to x address
//   // Then pipe calls to Discord channel and an arbitrage bot using a webhook (POST)
//   const pubsubAlice = await alice.createChannelPubsub(topicBSC, {
//     from: accountA,
//     middleware: {
//       incoming: [tap()],
//       outgoing: [tap()],
//     },
//     blockCodec,
//   })
//   const pubsubBob = await bob.createChannelPubsub(topicEthereum, {
//     from: accountB,
//     middleware: {
//       incoming: [tap()],
//       outgoing: [tap()],
//     },
//     blockCodec,
//   })
//   const pubsubCharlie = await charlie.createChannelPubsub(topicPolygon, {
//     from: accountC,
//     middleware: {
//       incoming: [tap()],
//       outgoing: [tap()],
//     },
//     blockCodec,
//   })

//   subscribeNewBlocks(
//     [
//       {
//         name: 'bsc',
//         chainId: '56',
//         rpc: 'wss://somerpc.server',
//       },
//     ],
//     (payload: any) => {
//       await alice.putBlock(payload, { topic })
//     },
//   )

//   subscribeNewBlocks(
//     [
//       {
//         name: 'mainnet',
//         chainId: '1',
//         rpc: 'wss://somerpc.server',
//       },
//     ],
//     (payload: any) => {
//       await alice.putBlock(payload, { topic })
//     },
//   )
//   subscribeNewBlocks(
//     [
//       {
//         name: 'polygon',
//         chainId: '137',
//         rpc: 'wss://somerpc.server',
//       },
//     ],
//     (payload: any) => {
//       await alice.putBlock(payload, { topic })
//     },
//   )
//   const aggregator = await consumer.aggregate(
//     [topicBSC, topicEthereum, topicPolygon],
//     {
//       from: accountConsumer,
//       middleware: {
//         incoming: [
//           filter(
//             (v: object) => v.address === '0x...' && v.event === 'Transfer',
//           ),
//           reduce((v, init) => (v = new BigNumber(init).add(v))),
//         ],
//       },
//       blockCodec,
//     },
//   )

//   aggregator.onBlockReply$.subscribe(async (block: WakuMessage) => {
//     // match topic
//     t.is(topic, JSON.parse(block.payloadAsUtf8).topic)
//   })
// })
