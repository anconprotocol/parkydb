"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const cbor_x_1 = require("cbor-x");
const eth_sig_util_1 = require("@metamask/eth-sig-util");
class MessagingService {
    constructor(web3Provider, pubkey, defaultAddress) {
        this.web3Provider = web3Provider;
        this.pubkey = pubkey;
        this.defaultAddress = defaultAddress;
    }
    async load(key, data) { }
    async bootstrap(options) {
        const config = options || { bootstrap: { default: true } };
        this.waku = await js_waku_1.Waku.create(config);
        return true;
    }
    async signEncryptionKey(appName, encryptionPublicKeyHex, ownerAddressHex, providerRequest) {
        const msgParams = this.buildMsgParams(appName, encryptionPublicKeyHex, ownerAddressHex);
        return providerRequest({
            method: 'eth_signTypedData_v4',
            params: [ownerAddressHex, msgParams],
            from: ownerAddressHex,
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
        return (recovered === msg.ethAddress);
    }
    async createTopic(topic, blockPublisher) {
        const pubsub = new rxjs_1.Subject();
        this.waku.relay.addObserver((msg) => {
            let message = (0, cbor_x_1.decode)(msg);
            if (this.pubkey && this.defaultAddress && this.web3Provider) {
                message = (0, cbor_x_1.decode)(msg);
            }
            pubsub.next(message);
        }, [topic]);
        const cancel = blockPublisher.subscribe(async (block) => {
            let message = { payload: block.document };
            if (this.pubkey && this.defaultAddress && this.web3Provider) {
                const sig = await this.signEncryptionKey(topic.split('/')[2], this.pubkey, this.defaultAddress, this.web3Provider.provider.request);
                const pubkeyMessage = {
                    signature: sig,
                    ethAddress: this.defaultAddress,
                    encryptionPublicKey: this.pubkey,
                };
                message = {
                    payload: block.document,
                    publicKeyMessage: pubkeyMessage,
                };
            }
            const packed = (0, cbor_x_1.encode)(message);
            const msg = await js_waku_1.WakuMessage.fromBytes(packed, topic);
            await this.waku.relay.send(msg);
        });
        return {
            onBlockReply$: pubsub.asObservable(),
            publish: async (block) => {
                const msg = await js_waku_1.WakuMessage.fromBytes(block.dag.bytes, topic);
                return this.waku.relay.send(msg);
            },
            close: () => {
                if (cancel)
                    cancel.unsubscribe();
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
            .pipe((0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), ...options.middleware.outgoing)
            .subscribe(async (block) => {
            const view = options.blockCodec.encode(block);
            const msg = await js_waku_1.WakuMessage.fromBytes(view, topic, {
                encPublicKey: options.pubkey,
                sigPrivKey: options.sigkey,
            });
            await this.waku.relay.send(msg);
        });
        return {
            onBlockReply$: pubsub
                .asObservable()
                .pipe((0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.map)(options.blockCodec.decode), ...options.middleware.incoming),
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
                .pipe((0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.tap)(), (0, rxjs_1.map)(options.blockCodec.decode), ...options.middleware.incoming),
            close: () => {
            },
        };
    }
}
exports.MessagingService = MessagingService;
//# sourceMappingURL=messaging.js.map