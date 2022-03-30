"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const { Crypto } = require("@peculiar/webcrypto");
const crypto = new Crypto();
global.crypto = crypto;
const js_waku_1 = require("js-waku");
const rxjs_1 = require("rxjs");
class MessagingService {
    constructor() { }
    load(key, data) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    bootstrap() {
        return __awaiter(this, void 0, void 0, function* () {
            this.waku = yield js_waku_1.Waku.create({ bootstrap: { default: true } });
            yield this.waku.waitForRemotePeer();
        });
    }
    createTopic(topic, blockPublisher) {
        return __awaiter(this, void 0, void 0, function* () {
            const pubsub = new rxjs_1.Subject();
            this.waku.relay.addObserver((msg) => {
                pubsub.next(msg);
            }, [topic]);
            const cancel = blockPublisher.subscribe((block) => __awaiter(this, void 0, void 0, function* () {
                const msg = yield js_waku_1.WakuMessage.fromBytes(block.dag.bytes, topic);
                yield this.waku.relay.send(msg);
            }));
            return {
                onBlockReply$: pubsub.asObservable(),
                publish: (block) => __awaiter(this, void 0, void 0, function* () {
                    const msg = yield js_waku_1.WakuMessage.fromBytes(block.dag.bytes, topic);
                    return this.waku.relay.send(msg);
                }),
                close: () => {
                    if (cancel)
                        cancel.unsubscribe();
                },
            };
        });
    }
    createChannel(topic, options, blockPublisher) {
        return __awaiter(this, void 0, void 0, function* () {
            const pubsub = new rxjs_1.Subject();
            this.waku.relay.addObserver((msg) => {
                if (options.middleware) {
                    pubsub.next(msg);
                }
            }, [topic]);
            const cancel = blockPublisher
                .pipe(rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), ...options.middleware.outgoing)
                .subscribe((block) => __awaiter(this, void 0, void 0, function* () {
                const view = options.blockCodec.encode(block);
                console.log(view);
                const msg = yield js_waku_1.WakuMessage.fromBytes(view, topic, {
                    encPublicKey: options.pubkey,
                    sigPrivKey: options.sigkey,
                });
                yield this.waku.relay.send(msg);
            }));
            return {
                onBlockReply$: pubsub
                    .asObservable()
                    .pipe(rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), rxjs_1.tap(), ...options.middleware.incoming.concat(rxjs_1.map((i) => options.blockCodec.decode(i)))),
                close: () => {
                    if (cancel)
                        cancel.unsubscribe();
                },
            };
        });
    }
}
exports.MessagingService = MessagingService;
//# sourceMappingURL=messaging.js.map