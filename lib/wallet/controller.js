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
exports.WalletController = void 0;
const ed25519keyring_1 = require("./ed25519keyring");
const simple_1 = require("./simple");
const KeyringController = require('eth-keyring-controller');
class WalletController {
    constructor() { }
    load(vaultStorage) {
        return __awaiter(this, void 0, void 0, function* () {
            let kr = yield vaultStorage.keyring.get({ id: 1 });
            kr = kr || {};
            this.keyringController = new KeyringController({
                keyringTypes: [ed25519keyring_1.Ed25519, simple_1.Simple],
                initState: kr.keyring || {},
            });
            this.keyringController.store.subscribe((state) => __awaiter(this, void 0, void 0, function* () {
                yield vaultStorage.keyring.put({ id: 1, keyring: state });
            }));
        });
    }
    get wallet() {
        const addEd25519 = (keys) => __awaiter(this, void 0, void 0, function* () {
            return this.keyringController.addNewKeyring(ed25519keyring_1.Ed25519.type, keys);
        });
        const addSecp256k1 = (keys) => __awaiter(this, void 0, void 0, function* () {
            return this.keyringController.addNewKeyring(simple_1.Simple.type, keys);
        });
        this.keyringController['addEd25519'] = addEd25519;
        this.keyringController['addSecp256k1'] = addSecp256k1;
        return this.keyringController;
    }
    createVault(password, seed) {
        return __awaiter(this, void 0, void 0, function* () {
            if (seed) {
                yield this.keyringController.createNewVaultAndRestore(password, seed);
            }
            yield this.keyringController.createNewVaultAndKeychain(password);
        });
    }
}
exports.WalletController = WalletController;
//# sourceMappingURL=controller.js.map