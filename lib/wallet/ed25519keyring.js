"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ed25519 = void 0;
var ed = __importStar(require("@noble/ed25519"));
var SimpleKeyring = require('eth-simple-keyring');
var Ed25519 = (function (_super) {
    __extends(Ed25519, _super);
    function Ed25519(opts) {
        var _this = _super.call(this) || this;
        _this._wallets = [];
        _this.deserialize(opts);
        return _this;
    }
    Ed25519.prototype.serialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this._wallets.map(function (_a) {
                        var privateKey = _a.privateKey;
                        return privateKey;
                    })];
            });
        });
    };
    Ed25519.prototype.deserialize = function (privateKeys) {
        if (privateKeys === void 0) { privateKeys = []; }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4, Promise.all(privateKeys.map(function (key) { return __awaiter(_this, void 0, void 0, function () {
                                var privateKey, publicKey;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            privateKey = Buffer.from(key, 'hex');
                                            return [4, ed.getPublicKey(privateKey)];
                                        case 1:
                                            publicKey = _a.sent();
                                            return [2, { privateKey: privateKey, publicKey: publicKey }];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a._wallets = _b.sent();
                        return [2];
                }
            });
        });
    };
    Ed25519.prototype.addAccounts = function (n) {
        if (n === void 0) { n = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var newWallets, i, privateKey, publicKey, hexWallets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newWallets = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < n)) return [3, 4];
                        privateKey = ed.utils.randomPrivateKey();
                        return [4, ed.getPublicKey(privateKey)];
                    case 2:
                        publicKey = _a.sent();
                        newWallets.push({ privateKey: privateKey, publicKey: publicKey });
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3, 1];
                    case 4:
                        this._wallets = this._wallets.concat(newWallets);
                        hexWallets = newWallets.map(function (_a) {
                            var publicKey = _a.publicKey;
                            return ed.utils.bytesToHex(publicKey);
                        });
                        return [2, hexWallets];
                }
            });
        });
    };
    Ed25519.prototype.getAccounts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this._wallets.map(function (_a) {
                        var publicKey = _a.publicKey;
                        return ed.utils.bytesToHex(publicKey);
                    })];
            });
        });
    };
    Ed25519.prototype.signTransaction = function (address, tx, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('unimplemented');
            });
        });
    };
    Ed25519.prototype.signMessage = function (address, data, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var privKey;
            return __generator(this, function (_a) {
                privKey = this._getPrivateKeyFor(address, opts);
                return [2, ed.sign(data, privKey)];
            });
        });
    };
    Ed25519.prototype.signPersonalMessage = function (address, msgHex, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('unimplemented');
            });
        });
    };
    Ed25519.prototype.decryptMessage = function (withAccount, encryptedData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('unimplemented');
            });
        });
    };
    Ed25519.prototype.signTypedData = function (withAccount, typedData, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('unimplemented');
            });
        });
    };
    Ed25519.prototype.getEncryptionPublicKey = function (withAccount, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('unimplemented');
            });
        });
    };
    Ed25519.prototype._getPrivateKeyFor = function (address, opts) {
        if (opts === void 0) { opts = {}; }
        if (!address) {
            throw new Error('Must specify address.');
        }
        var wallet = this._getWalletForAccount(address, opts);
        return wallet.privateKey;
    };
    Ed25519.prototype.getAppKeyAddress = function (address, origin) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet;
            return __generator(this, function (_a) {
                if (!origin || typeof origin !== 'string') {
                    throw new Error("'origin' must be a non-empty string");
                }
                wallet = this._getWalletForAccount(address, {
                    withAppKeyOrigin: origin,
                });
                return [2, ed.utils.bytesToHex(wallet.publicKey)];
            });
        });
    };
    Ed25519.prototype.exportAccount = function (address, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var wallet;
            return __generator(this, function (_a) {
                wallet = this._getWalletForAccount(address, opts);
                return [2, ed.utils.bytesToHex(wallet.privateKey)];
            });
        });
    };
    Ed25519.prototype.removeAccount = function (address) {
        if (!this._wallets
            .map(function (_a) {
            var publicKey = _a.publicKey;
            return ed.utils.bytesToHex(publicKey);
        })
            .includes(address.toLowerCase())) {
            throw new Error("Address " + address + " not found in this keyring");
        }
        this._wallets = this._wallets.filter(function (_a) {
            var publicKey = _a.publicKey;
            return ed.utils.bytesToHex(publicKey).toLowerCase() !== address.toLowerCase();
        });
    };
    Ed25519.prototype._getWalletForAccount = function (account, opts) {
        if (opts === void 0) { opts = {}; }
        var wallet = this._wallets.find(function (_a) {
            var publicKey = _a.publicKey;
            return ed.utils.bytesToHex(publicKey) === account;
        });
        if (!wallet) {
            throw new Error('Simple Keyring - Unable to find matching address.');
        }
        return wallet;
    };
    Ed25519.type = 'Ed25519';
    return Ed25519;
}(SimpleKeyring));
exports.Ed25519 = Ed25519;
//# sourceMappingURL=ed25519keyring.js.map