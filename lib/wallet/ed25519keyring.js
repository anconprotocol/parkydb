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
exports.Ed25519 = void 0;
const ed = __importStar(require("@noble/ed25519"));
const SimpleKeyring = require('eth-simple-keyring');
class Ed25519 extends SimpleKeyring {
    constructor(opts) {
        super();
        this._wallets = [];
        this.deserialize(opts);
    }
    async serialize() {
        return this._wallets.map(({ privateKey }) => privateKey);
    }
    async deserialize(privateKeys = []) {
        this._wallets = await Promise.all(privateKeys.map(async (key) => {
            const privateKey = Buffer.from(key, 'hex');
            const publicKey = await ed.getPublicKey(privateKey);
            return { privateKey, publicKey };
        }));
    }
    async addAccounts(n = 1) {
        const newWallets = [];
        for (let i = 0; i < n; i++) {
            const privateKey = ed.utils.randomPrivateKey();
            const publicKey = await ed.getPublicKey(privateKey);
            newWallets.push({ privateKey, publicKey });
        }
        this._wallets = this._wallets.concat(newWallets);
        const hexWallets = newWallets.map(({ publicKey }) => ed.utils.bytesToHex(publicKey));
        return hexWallets;
    }
    async getAccounts() {
        return this._wallets.map(({ publicKey }) => ed.utils.bytesToHex(publicKey));
    }
    async signTransaction(address, tx, opts = {}) {
        throw new Error('unimplemented');
    }
    async signMessage(address, data, opts = {}) {
        const privKey = this._getPrivateKeyFor(address, opts);
        return ed.sign(data, privKey);
    }
    async signPersonalMessage(address, msgHex, opts = {}) {
        throw new Error('unimplemented');
    }
    async decryptMessage(withAccount, encryptedData) {
        throw new Error('unimplemented');
    }
    async signTypedData(withAccount, typedData, opts = {}) {
        throw new Error('unimplemented');
    }
    async getEncryptionPublicKey(withAccount, opts = {}) {
        throw new Error('unimplemented');
    }
    _getPrivateKeyFor(address, opts = {}) {
        if (!address) {
            throw new Error('Must specify address.');
        }
        const wallet = this._getWalletForAccount(address, opts);
        return wallet.privateKey;
    }
    async getAppKeyAddress(address, origin) {
        if (!origin || typeof origin !== 'string') {
            throw new Error(`'origin' must be a non-empty string`);
        }
        const wallet = this._getWalletForAccount(address, {
            withAppKeyOrigin: origin,
        });
        return ed.utils.bytesToHex(wallet.publicKey);
    }
    async exportAccount(address, opts = {}) {
        const wallet = this._getWalletForAccount(address, opts);
        return ed.utils.bytesToHex(wallet.privateKey);
    }
    removeAccount(address) {
        if (!this._wallets
            .map(({ publicKey }) => ed.utils.bytesToHex(publicKey))
            .includes(address.toLowerCase())) {
            throw new Error(`Address ${address} not found in this keyring`);
        }
        this._wallets = this._wallets.filter(({ publicKey }) => ed.utils.bytesToHex(publicKey).toLowerCase() !== address.toLowerCase());
    }
    _getWalletForAccount(account, opts = {}) {
        let wallet = this._wallets.find(({ publicKey }) => ed.utils.bytesToHex(publicKey) === account);
        if (!wallet) {
            throw new Error('Simple Keyring - Unable to find matching address.');
        }
        return wallet;
    }
}
exports.Ed25519 = Ed25519;
Ed25519.type = 'Ed25519';
//# sourceMappingURL=ed25519keyring.js.map