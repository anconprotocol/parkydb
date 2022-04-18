"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnconService = void 0;
const ethers_1 = require("ethers");
class AnconService {
    constructor(provider, rpc) {
        this.provider = provider;
        this.rpc = rpc;
    }
    async sign(data) {
        const b = ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.toUtf8Bytes(data));
        const res = await this.provider.send({
            id: 1,
            jsonrpc: '2.0',
            method: 'eth_sign',
            params: [this.provider.accounts[0], b],
        });
        const signature = res;
        return { digest: b, signature };
    }
    async createDid(did, pubkey, message, customSigner) {
        const base58Encode = ethers_1.ethers.utils.base58.encode(pubkey);
        let signer = this.sign;
        const messageDid = message ||
            `#Welcome to Ancon Protocol!
    
        For more information read the docs https://anconprotocol.github.io/docs/
    
        To make free posts and gets to the DAG Store you have to enroll and pay the service fee
    
        This request will not trigger a blockchain transaction or cost any gas fees.
        by signing this message you accept the terms and conditions of Ancon Protocol
        `;
        if (!!customSigner) {
            signer = customSigner;
        }
        const { signature, digest } = await signer(messageDid);
        const payload = {
            ...did,
            pub: base58Encode,
            signature: signature,
            message: message,
        };
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        };
        const rawResponse = await fetch(`${this.rpc}/v0/did`, requestOptions);
        return rawResponse.json();
    }
    async createDagBlock(from, options, customSigner) {
        let signer = this.sign;
        if (!!customSigner) {
            signer = customSigner;
        }
        const { signature, digest } = await signer(JSON.stringify(options.message));
        let payload = {
            path: '/',
            from,
            signature,
            data: options.message,
        };
        if (options.topic) {
            payload.topic = options.topic;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        };
        const rawResponse = await fetch(`${this.rpc}/v0/dag`, requestOptions);
        return rawResponse.json();
    }
}
exports.AnconService = AnconService;
//# sourceMappingURL=ancon.js.map