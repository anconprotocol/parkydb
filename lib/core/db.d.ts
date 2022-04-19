/// <reference types="node" />
import { CID } from 'blockstore-core/base';
import { Table } from 'dexie';
import 'dexie-observable/api';
import { Block } from 'multiformats/block';
import { ChannelOptions } from './messaging';
import { Observable } from 'rxjs';
import { AnconService } from './ancon';
import { IPFSService } from './ipfs';
export declare class ParkyDB {
    private keyringController;
    private dagService;
    private graphqlService;
    private jsonschemaService;
    private hooks;
    private onBlockCreated;
    private anconService;
    private messagingService;
    private ipfsService;
    db: any;
    syncTopic: string;
    syncPubsub: any;
    syncPubsubDexie: any;
    store: any;
    constructor(name: string);
    initialize(options: {
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
    getSyncStore(filter: any): Promise<Observable<import("js-waku").WakuMessage>>;
    getTopicStore(topics: string[], filter: any): Promise<Observable<import("js-waku").WakuMessage>>;
    putBlock(payload: any, options?: any): Promise<{
        id: string;
        model: any;
    } | {
        id: string;
        model?: undefined;
    }>;
    put(key: CID, value: Block<any>): Promise<any>;
    createTopicPubsub(topic: string, options: ChannelOptions): Promise<import("../interfaces/PubsubTopic").PubsubTopic>;
    emitKeyExchangePublicKey(topic: string, options: ChannelOptions): Promise<Observable<boolean>>;
    requestKeyExchangePublicKey(topic: string, options: ChannelOptions): Promise<any>;
    getWallet(): Promise<any>;
    get ancon(): AnconService;
    get ipfs(): IPFSService;
    createChannelPubsub(topic: string, options: ChannelOptions): Promise<import("..").ChannelTopic>;
    aggregate(topic: string[], options: ChannelOptions): Promise<import("..").ChannelTopic>;
    get(key: any, options?: any): Promise<any>;
    queryBlocks$(fn: (blocks: Table) => () => unknown): Promise<import("dexie").Observable<unknown>>;
    getBlocksByTableName$(tableName: string, fn: (table: Table) => () => unknown): Promise<import("dexie").Observable<unknown>>;
    query(options: any): Promise<any>;
    get graphqlSchema(): import("graphql").GraphQLSchema;
}
