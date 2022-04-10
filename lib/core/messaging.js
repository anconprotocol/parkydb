"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const { Crypto } = require('@peculiar/webcrypto');
const crypto = new Crypto();
if (!global.window) {
    global.crypto = crypto;
}
const js_waku_1 = require("js-waku");
const rxjs_1 = require("rxjs");
const sigUtil = __importStar(require("@metamask/eth-sig-util"));
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const utils_1 = require("ethers/lib/utils");
class MessagingService {
    constructor(web3Provider, pubkey, pubkeySig, defaultAddress) {
        this.web3Provider = web3Provider;
        this.pubkey = pubkey;
        this.pubkeySig = pubkeySig;
        this.defaultAddress = defaultAddress;
    }
    async load(key, data) { }
    async bootstrap(options) {
        const config = options || { bootstrap: { default: true } };
        this.waku = await js_waku_1.Waku.create(config);
        const available = await this.waku.waitForRemotePeer();
        return { waku: this.waku, connected: available };
    }
    async signEncryptionKey(appName, encryptionPublicKeyHex, ownerAddressHex, providerRequest) {
        const msgParams = this.buildMsgParams(appName, encryptionPublicKeyHex, ownerAddressHex);
        return providerRequest({
            method: 'eth_signTypedData_v4',
            params: [ownerAddressHex, msgParams],
            from: ownerAddressHex,
        });
    }
    buildBlockDocument(topicDomainName, storageBlock) {
        return JSON.stringify({
            domain: {
                name: topicDomainName,
                version: '1',
            },
            message: {
                ...storageBlock,
            },
            primaryType: 'StorageBlock',
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                ],
                StorageAsset: [
                    { name: 'name', type: 'string' },
                    { name: 'kind', type: 'string' },
                    { name: 'timestamp', type: 'number' },
                    { name: 'description', type: 'string' },
                    { name: 'image', type: 'string' },
                    { name: 'sources', type: 'string[]' },
                    { name: 'owner', type: 'string' },
                ],
                StorageBlock: [
                    { name: 'content', type: 'StorageAsset' },
                    { name: 'kind', type: 'string' },
                    { name: 'timestamp', type: 'string' },
                    { name: 'issuer', type: 'string' },
                ],
            },
        });
    }
    buildMsgParams(topicDomainName, encryptionPublicKeyHex, ownerAddressHex) {
        return JSON.stringify({
            domain: {
                name: topicDomainName,
                version: '1',
            },
            message: {
                message: 'By signing this message you certify that messages addressed to `ownerAddress` must be encrypted with `encryptionPublicKey`',
                encryptionPublicKey: encryptionPublicKeyHex,
                ownerAddress: ownerAddressHex,
            },
            primaryType: 'PublishEncryptionPublicKey',
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                ],
                PublishEncryptionPublicKey: [
                    { name: 'message', type: 'string' },
                    { name: 'encryptionPublicKey', type: 'string' },
                    { name: 'ownerAddress', type: 'string' },
                ],
            },
        });
    }
    validatePublicKeyMessage(domainName, msg) {
        const recovered = sigUtil.recoverTypedSignature({
            data: JSON.parse(this.buildMsgParams(domainName, msg.encryptionPublicKey, msg.ethAddress)),
            signature: msg.signature,
            version: eth_sig_util_1.SignTypedDataVersion.V4,
        });
        return recovered === msg.ethAddress;
    }
    async createTopic(topic, options, privateKey, encPublicKey) {
        if (options.isKeyExchangeChannel) {
            this.waku.addDecryptionKey(privateKey);
        }
        let pub = new rxjs_1.Subject();
        let pub$ = pub.pipe();
        if (options.middleware && options.middleware.outgoing) {
            pub$ = pub.pipe(rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), ...options.middleware.outgoing);
        }
        let pubsub = new rxjs_1.Subject();
        if (options.canSubscribe) {
            this.waku.relay.addObserver((msg) => {
                let message = options.blockCodec.decode(msg.payload);
                if (this.pubkey && this.defaultAddress && this.web3Provider) {
                    message = options.blockCodec.decode(msg.payload);
                }
                if (msg.contentTopic === topic) {
                    pubsub.next({ message: msg, decoded: message });
                }
            }, [topic]);
        }
        let onBlockReply$ = pubsub.asObservable();
        if (options.middleware && options.middleware.incoming) {
            onBlockReply$ = pubsub
                .asObservable()
                .pipe(rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), ...options.middleware.incoming);
        }
        let cancel;
        if (options.canPublish) {
            cancel = pub$.subscribe(async (block) => {
                let message = { payload: block };
                if (this.pubkey && this.defaultAddress && this.web3Provider) {
                    const msg = this.buildBlockDocument('data.universal', block);
                    const sig = await this.web3Provider.provider.send({
                        method: 'eth_signTypedData_v4',
                        params: [this.defaultAddress, msg],
                        from: this.defaultAddress,
                    });
                    const pubkeyMessage = {
                        signature: sig,
                        ethAddress: this.defaultAddress,
                        encryptionPublicKey: this.pubkey,
                    };
                    message = {
                        payload: {
                            ...block,
                            signature: sig,
                        },
                        publicKeyMessage: pubkeyMessage,
                    };
                }
                const packed = await options.blockCodec.encode(message);
                let config = {
                    encPublicKey: utils_1.arrayify(encPublicKey),
                };
                if (options.isKeyExchangeChannel) {
                    config = {};
                }
                const msg = await js_waku_1.WakuMessage.fromBytes(packed, topic, config);
                await this.waku.relay.send(msg);
            });
        }
        return {
            onBlockReply$,
            publish: (block) => pub.next(block),
            close: () => {
                if (cancel) {
                    cancel.unsubscribe();
                }
            },
        };
    }
    async createChannel(topic, options, blockPublisher) {
        const pubsub = new rxjs_1.Subject();
        this.waku.relay.addObserver((msg) => {
            if (options.middleware) {
                pubsub.next(msg);
            }
        }, [topic]);
        const cancel = blockPublisher
            .pipe(rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), ...options.middleware.outgoing)
            .subscribe(async (block) => {
            const view = await options.blockCodec.encode(block);
            const msg = await js_waku_1.WakuMessage.fromBytes(view, topic, {});
            await this.waku.relay.send(msg);
        });
        return {
            onBlockReply$: pubsub
                .asObservable()
                .pipe(rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.map(options.blockCodec.decode), ...options.middleware.incoming),
            close: () => {
                if (cancel)
                    cancel.unsubscribe();
            },
        };
    }
    async aggregate(topics, options) {
        const pubsub = new rxjs_1.Subject();
        this.waku.relay.addObserver((msg) => {
            if (options.middleware) {
                pubsub.next(msg);
            }
        }, topics);
        return {
            onBlockReply$: pubsub
                .asObservable()
                .pipe(rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.map(options.blockCodec.decode), ...options.middleware.incoming),
            close: () => {
            },
        };
    }
}
exports.MessagingService = MessagingService;
//# sourceMappingURL=messaging.js.map