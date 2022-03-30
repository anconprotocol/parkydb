import { Waku } from 'js-waku';
import { BlockCodec } from 'multiformats/codecs/interface';
import { Observable, Subject } from 'rxjs';
import { BlockValue } from '../interfaces/Blockvalue';
import { ChannelTopic } from '../interfaces/ChannelTopic';
import { PubsubTopic } from '../interfaces/PubsubTopic';
export interface IMessaging {
    bootstrap(): void;
}
export interface ChannelOptions {
    from: string;
    sigkey?: Uint8Array;
    pubkey?: Uint8Array;
    blockCodec: BlockCodec<any, unknown>;
    middleware: {
        incoming: Array<(a: Observable<any>) => Observable<unknown>>;
        outgoing: Array<(a: Observable<any>) => Observable<unknown>>;
    };
}
export declare class MessagingService implements IMessaging {
    waku: Waku;
    constructor();
    load(key: any, data: any): Promise<any>;
    bootstrap(): Promise<void>;
    createTopic(topic: string, blockPublisher: Subject<BlockValue>): Promise<PubsubTopic>;
    createChannel(topic: string, options: ChannelOptions, blockPublisher: Subject<BlockValue>): Promise<ChannelTopic>;
}
