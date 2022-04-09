"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPFSService = void 0;
class IPFSService {
    constructor(gateway, rpc) {
        this.gateway = gateway;
        this.rpc = rpc;
    }
    async uploadFile(content) {
        const body = new FormData();
        body.append('file', content);
        const ipfsAddRes = await fetch(`${this.rpc}/api/v0/add?pin=true`, {
            body,
            method: 'POST',
        });
        const ipfsAddResJSON = await ipfsAddRes.json();
        const cid = ipfsAddResJSON.Hash;
        const imageUrl = `${this.gateway}/ipfs/${cid}`;
        return {
            image: imageUrl,
            cid: cid,
            error: false,
        };
    }
}
exports.IPFSService = IPFSService;
//# sourceMappingURL=ipfs.js.map