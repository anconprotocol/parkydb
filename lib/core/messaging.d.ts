import { Waku } from 'js-waku';
import { BlockCodec } from 'multiformats/codecs/interface';
import { Observable, Subject } from 'rxjs';
import { BlockValue } from '../interfaces/Blockvalue';
import { ChannelTopic } from '../interfaces/ChannelTopic';
import { PubsubTopic } from '../interfaces/PubsubTopic';
import { PublicKeyMessage } from '../interfaces/PublicKeyMessage';
import { StorageBlock } from '../interfaces/StorageKind';
export interface IMessaging {
    bootstrap(options: any): void;
}
export interface ChannelOptions {
    pk?: string;
    pub?: string;
    encryptionPubKey?: string;
    from?: string;
    sigkey?: string;
    canPublish?: boolean;
    canDecrypt?: boolean;
    isCRDT?: boolean;
    isKeyExchangeChannel?: boolean;
    canSubscribe?: boolean;
    blockCodec: BlockCodec<any, unknown>;
    middleware: {
        incoming: Array<(a: Observable<any>) => Observable<unknown>>;
        outgoing: Array<(a: Observable<any>) => Observable<unknown>>;
    };
}
export declare class MessagingService implements IMessaging {
    private web3Provider;
    private defaultAddress;
    waku: Waku;
    constructor(web3Provider: any, defaultAddress: string);
    load(key: any, data: any): Promise<any>;
    bootstrap(options: any): Promise<{
        waku: Waku;
        connected: void;
    }>;
    signEncryptionKey(appName: string, encryptionPublicKeyHex: string, ownerAddressHex: string, providerRequest: (request: {
        method: string;
        from: string;
        params?: Array<any>;
    }) => Promise<any>): Promise<string>;
    buildBlockDocument(topicDomainName: string, storageBlock: StorageBlock): string;
    buildMsgParams(topicDomainName: string, encryptionPublicKeyHex: string, ownerAddressHex: string): string;
    validatePublicKeyMessage(domainName: string, msg: PublicKeyMessage): boolean;
    subscribeStore(topics: string[], timeFilter: any): Promise<Observable<any>>;
    createTopic(topic: string, options: ChannelOptions): Promise<PubsubTopic>;
    createChannel(topic: string, options: ChannelOptions, blockPublisher: Subject<BlockValue>): Promise<ChannelTopic>;
    aggregate(topics: string[], options: ChannelOptions): Promise<ChannelTopic>;
}
