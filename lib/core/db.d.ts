import { CID } from 'blockstore-core/base';
import 'dexie-observable/api';
import { Block } from 'multiformats/block';
import { ChannelOptions } from './messaging';
import { WalletController } from '../wallet/controller';
export declare class ParkyDB extends WalletController {
    private dagService;
    private graphqlService;
    private jsonschemaService;
    private messagingService;
    private hooks;
    private onBlockCreated;
    db: any;
    constructor();
    initialize(options?: any): Promise<void>;
    putBlock(payload: any, options?: any): Promise<any>;
    put(key: CID, value: Block<any>): Promise<any>;
    createTopicPubsub(topic: string): Promise<import("../interfaces/PubsubTopic").PubsubTopic>;
    createChannelPubsub(topic: string, options: ChannelOptions): Promise<import("..").ChannelTopic>;
    get(key: any, options?: any): Promise<any>;
    filter(options: any): Promise<any>;
    query(options: any): Promise<any>;
}
