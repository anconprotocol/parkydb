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
exports.Ed25519 = void 0;
const ed = __importStar(require("@noble/ed25519"));
const SimpleKeyring = require('eth-simple-keyring');
class Ed25519 extends SimpleKeyring {
    constructor(opts) {
        super();
        this._wallets = [];
        this.deserialize(opts);
    }
    serialize() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._wallets.map(({ privateKey }) => privateKey);
        });
    }
    deserialize(privateKeys = []) {
        return __awaiter(this, void 0, void 0, function* () {
            this._wallets = yield Promise.all(privateKeys.map((key) => __awaiter(this, void 0, void 0, function* () {
                const privateKey = Buffer.from(key, 'hex');
                const publicKey = yield ed.getPublicKey(privateKey);
                return { privateKey, publicKey };
            })));
        });
    }
    addAccounts(n = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const newWallets = [];
            for (let i = 0; i < n; i++) {
                const privateKey = ed.utils.randomPrivateKey();
                const publicKey = yield ed.getPublicKey(privateKey);
                newWallets.push({ privateKey, publicKey });
            }
            this._wallets = this._wallets.concat(newWallets);
            const hexWallets = newWallets.map(({ publicKey }) => ed.utils.bytesToHex(publicKey));
            return hexWallets;
        });
    }
    getAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._wallets.map(({ publicKey }) => ed.utils.bytesToHex(publicKey));
        });
    }
    signTransaction(address, tx, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('unimplemented');
        });
    }
    signMessage(address, data, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const privKey = this._getPrivateKeyFor(address, opts);
            return ed.sign(data, privKey);
        });
    }
    signPersonalMessage(address, msgHex, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('unimplemented');
        });
    }
    decryptMessage(withAccount, encryptedData) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('unimplemented');
        });
    }
    signTypedData(withAccount, typedData, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('unimplemented');
        });
    }
    getEncryptionPublicKey(withAccount, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('unimplemented');
        });
    }
    _getPrivateKeyFor(address, opts = {}) {
        if (!address) {
            throw new Error('Must specify address.');
        }
        const wallet = this._getWalletForAccount(address, opts);
        return wallet.privateKey;
    }
    getAppKeyAddress(address, origin) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!origin || typeof origin !== 'string') {
                throw new Error(`'origin' must be a non-empty string`);
            }
            const wallet = this._getWalletForAccount(address, {
                withAppKeyOrigin: origin,
            });
            return ed.utils.bytesToHex(wallet.publicKey);
        });
    }
    exportAccount(address, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = this._getWalletForAccount(address, opts);
            return ed.utils.bytesToHex(wallet.privateKey);
        });
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