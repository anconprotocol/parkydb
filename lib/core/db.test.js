"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const resolvers_1 = require("../resolvers");
const db_1 = require("./db");
const payload = {
    kind: 'VerifiableBlock',
    commitHash: 'xg8pyBr3McqYlUgxAqV0t3s6TRcP+B7MHyPTtyVKMJw=',
    contentHash: {
        '/': 'baguqeerahiqryfzwbjc2fn7is4k2uupilwtoxabtb6noifnwxznxszuvrg6a',
    },
    digest: '0x5ab3124ede7a511fbc7c6302b164d1547aefda8b5909b6bb637c7da025c3ffaf',
    height: 207,
    issuer: '0x32A21c1bB6E7C20F547e930b53dAC57f42cd25F6',
    key: 'YW5jb25wcm90b2NvbC91c2Vycy9kaWQ6ZXRocjpibmJ0OjB4MzJBMjFjMWJCNkU3QzIwRjU0N2U5MzBiNTNkQUM1N2Y0MmNkMjVGNi9iYWd1cWVlcmFoaXFyeWZ6d2JqYzJmbjdpczRrMnV1cGlsd3RveGFidGI2bm9pZm53eHpueHN6dXZyZzZh',
    lastBlockHash: {
        '/': 'baguqeeraw4ssfjictj2b47cccep2oioytbjistjke2xuaa35qgdoivtgrwra',
    },
    network: 'anconprotocol',
    parentHash: {
        '/': 'baguqeerakv6jersryhhanjaihmb2ncdujajxt7gpkfzs7rkur7lo4s5uecwa',
    },
    rootKey: 'YW5jb25wcm90b2NvbC91c2Vycy9kaWQ6ZXRocjpibmJ0OjB4MzJBMjFjMWJCNkU3QzIwRjU0N2U5MzBiNTNkQUM1N2Y0MmNkMjVGNg==',
    signature: '0xa628e3e256a187453c55ffbebc189ec4464c6c0d874a278272d224dbbaa4f6f028d3550651c33edf7af0ea8b3f3806d09ba9135034a61dd1a651c67f83cb06a51b',
    timestamp: 1645384767,
    content: {
        blockchainTokenId: '8',
        blockchainTxHash: '0x977dd680952c4f7da1040d12a0a2c9e68a60f6158edee20b1591f91372030670',
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
};
ava_1.default.beforeEach(async (t) => {
    const db = new db_1.ParkyDB('tests');
    await db.initialize({
        graphql: { resolvers: resolvers_1.defaultResolvers },
        withWallet: {
            password: 'zxcvb',
            seed: 'opera offer craft joke defy team prosper tragic reopen street advice moral',
        },
    });
    t.context = {
        db,
    };
});
ava_1.default('foo', (t) => {
    t.pass();
});
ava_1.default('put', async (t) => {
    const { db } = t.context;
    const { id } = await db.putBlock(payload);
    const res = await db.get(id, null);
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
    });
    t.is(q.data.block.cid, 'baguqeerabve7ug2qddskk3mpomdt3xdnhvh53jvmca7qh43p36y5hfoassoq');
});
//# sourceMappingURL=db.test.js.map