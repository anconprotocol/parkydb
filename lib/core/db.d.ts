import { CID } from 'blockstore-core/base';
import { Table } from 'dexie';
import 'dexie-observable/api';
import { Block } from 'multiformats/block';
import { ChannelOptions } from './messaging';
import { WalletController } from '../wallet/controller';
export declare class ParkyDB extends WalletController {
    private dagService;
    private graphqlService;
    private jsonschemaService;
    private hooks;
    private onBlockCreated;
    db: any;
    private messagingService;
    constructor();
    initialize(options?: any): Promise<boolean>;
    putBlock(payload: any, options?: any): Promise<{
        id: string;
        model: any;
    } | {
        id: string;
        model?: undefined;
    }>;
    put(key: CID, value: Block<any>): Promise<any>;
    createTopicPubsub(topic: string): Promise<import("../interfaces/PubsubTopic").PubsubTopic>;
    createChannelPubsub(topic: string, options: ChannelOptions): Promise<import("..").ChannelTopic>;
    get(key: any, options?: any): Promise<any>;
    queryBlocks$(fn: (blocks: Table) => () => unknown): Promise<import("dexie").Observable<unknown>>;
    query(options: any): Promise<any>;
}
