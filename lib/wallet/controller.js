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
exports.WalletController = void 0;
var ed25519keyring_1 = require("./ed25519keyring");
var simple_1 = require("./simple");
var KeyringController = require('eth-keyring-controller');
var WalletController = (function () {
    function WalletController() {
    }
    WalletController.prototype.load = function (vaultStorage) {
        return __awaiter(this, void 0, void 0, function () {
            var kr;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, vaultStorage.keyring.get({ id: 1 })];
                    case 1:
                        kr = _a.sent();
                        kr = kr || {};
                        this.keyringController = new KeyringController({
                            keyringTypes: [ed25519keyring_1.Ed25519, simple_1.Simple],
                            initState: kr.keyring || {},
                        });
                        this.keyringController.store.subscribe(function (state) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, vaultStorage.keyring.put({ id: 1, keyring: state })];
                                    case 1:
                                        _a.sent();
                                        return [2];
                                }
                            });
                        }); });
                        return [2];
                }
            });
        });
    };
    Object.defineProperty(WalletController.prototype, "wallet", {
        get: function () {
            var _this = this;
            var addEd25519 = function (keys) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.keyringController.addNewKeyring(ed25519keyring_1.Ed25519.type, keys)];
                });
            }); };
            var addSecp256k1 = function (keys) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, this.keyringController.addNewKeyring(simple_1.Simple.type, keys)];
                });
            }); };
            this.keyringController['addEd25519'] = addEd25519;
            this.keyringController['addSecp256k1'] = addSecp256k1;
            return this.keyringController;
        },
        enumerable: false,
        configurable: true
    });
    WalletController.prototype.createVault = function (password, seed) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!seed) return [3, 2];
                        return [4, this.keyringController.createNewVaultAndRestore(password, seed)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4, this.keyringController.createNewVaultAndKeychain(password)];
                    case 3:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    return WalletController;
}());
exports.WalletController = WalletController;
//# sourceMappingURL=controller.js.map