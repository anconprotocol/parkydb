"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnconService = void 0;
const ethers_1 = require("ethers");
class AnconService {
    constructor(provider, pubkey, rpc) {
        this.provider = provider;
        this.pubkey = pubkey;
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
    async createDid() {
        const base58Encode = ethers_1.ethers.utils.base58.encode(this.pubkey);
        const message = `#Welcome to Ancon Protocol!
    
        For more information read the docs https://anconprotocol.github.io/docs/
    
        To make free posts and gets to the DAG Store you have to enroll and pay the service fee
    
        This request will not trigger a blockchain transaction or cost any gas fees.
        by signing this message you accept the terms and conditions of Ancon Protocol
        `;
        const { signature, digest } = await this.sign(message);
        const web3provider = new ethers_1.ethers.providers.Web3Provider(this.provider);
        const network = await web3provider.getNetwork();
        const payload = {
            ethrdid: `did:ethr:${network.name}:${this.provider.accounts[0]}`,
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
    async createDagBlock(options) {
        const { signature, digest } = await this.sign(JSON.stringify(options.message));
        const web3provider = new ethers_1.ethers.providers.Web3Provider(this.provider);
        const network = await web3provider.getNetwork();
        const payload = {
            path: '/',
            from: `did:ethr:${network.name}:${this.provider.accounts[0]}`,
            signature,
            topic: options.topic,
            data: options.message,
        };
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