/// <reference types="node" />
import { CID } from 'blockstore-core/base';
import { Block } from 'multiformats/block';
import { ChannelOptions } from './messaging';
import { AnconService } from './ancon';
import { IPFSService } from './ipfs';
export declare class ParkyDB {
    private name;
    private keyringController;
    private dagService;
    private graphqlService;
    private jsonschemaService;
    private anconService;
    private messagingService;
    private ipfsService;
    db: any;
    syncTopic: string;
    syncPubsub: any;
    syncPubsubDexie: any;
    store: any;
    constructor(name: string);
    initialize<T>(options: {
        withDB: {
            provider: {
                new (): T;
            };
            options: any;
        };
        withWallet: any;
        withWeb3?: any;
        withAncon?: any;
        withIpfs?: any;
        wakuconnect?: any;
        enableSync?: any;
        documentTypes?: any;
        graphql: {
            resolvers: any;
        };
    }): Promise<{
        waku: import("js-waku").Waku;
        connected: void;
    }>;
    get defaultBlockCodec(): {
        name: string;
        code: string;
        encode: (obj: any) => Promise<Buffer>;
        decode: (buffer: any) => any;
    };
    getSyncStore(filter: any): Promise<import("rxjs").Observable<import("js-waku").WakuMessage>>;
    getTopicStore(topics: string[], filter: any): Promise<import("rxjs").Observable<import("js-waku").WakuMessage>>;
    putBlock(payload: any, options?: any): Promise<{
        id: string;
        model: any;
    } | {
        id: string;
        model?: undefined;
    }>;
    put(key: CID, value: Block<any>): Promise<any>;
    createTopicPubsub(topic: string, options: ChannelOptions): Promise<import("../parkydb-interfaces").PubsubTopic>;
    emitKeyExchangePublicKey(topic: string, options: ChannelOptions): Promise<import("rxjs").Observable<boolean>>;
    requestKeyExchangePublicKey(topic: string, options: ChannelOptions): Promise<any>;
    getWallet(): Promise<any>;
    get ancon(): AnconService;
    get ipfs(): IPFSService;
    createChannelPubsub(topic: string, options: ChannelOptions): Promise<import("..").ChannelTopic>;
    aggregate(topic: string[], options: ChannelOptions): Promise<import("..").ChannelTopic>;
    get(key: any, options?: any): Promise<any>;
    queryBlocks$(fn: (blocks: any) => () => unknown): Promise<any>;
    getBlocksByTableName$(tableName: string, fn: (table: any) => () => unknown): Promise<any>;
    query(options: any): Promise<any>;
    get graphqlSchema(): any;
}
