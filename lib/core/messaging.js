"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const { Crypto } = require('@peculiar/webcrypto');
const crypto = new Crypto();
if (!window.crypto) {
    global.crypto = crypto;
}
const js_waku_1 = require("js-waku");
const rxjs_1 = require("rxjs");
class MessagingService {
    constructor() { }
    async load(key, data) { }
    async bootstrap(options) {
        const config = options || { bootstrap: { default: true } };
        this.waku = await js_waku_1.Waku.create(config);
        await this.waku.waitForRemotePeer();
    }
    async createTopic(topic, blockPublisher) {
        const pubsub = new rxjs_1.Subject();
        this.waku.relay.addObserver((msg) => {
            pubsub.next(msg);
        }, [topic]);
        const cancel = blockPublisher.subscribe(async (block) => {
            const msg = await js_waku_1.WakuMessage.fromBytes(block.dag.bytes, topic);
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
            .pipe(rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), ...options.middleware.outgoing)
            .subscribe(async (block) => {
            const view = options.blockCodec.encode(block);
            console.log(view);
            const msg = await js_waku_1.WakuMessage.fromBytes(view, topic, {
                encPublicKey: options.pubkey,
                sigPrivKey: options.sigkey,
            });
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