"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const ed25519keyring_1 = require("./ed25519keyring");
const simple_1 = require("./simple");
const KeyringController = require('eth-keyring-controller');
class WalletController {
    constructor() { }
    async load(vaultStorage) {
        let kr = await vaultStorage.keyring.get({ id: 1 });
        kr = kr || {};
        this.keyringController = new KeyringController({
            keyringTypes: [ed25519keyring_1.Ed25519, simple_1.Simple],
            initState: kr.keyring || {},
        });
        this.keyringController.store.subscribe(async (state) => {
            await vaultStorage.keyring.put({ id: 1, keyring: state }, 1);
        });
    }
    get wallet() {
        const addEd25519 = async (keys) => {
            return this.keyringController.addNewKeyring(ed25519keyring_1.Ed25519.type, keys);
        };
        const addSecp256k1 = async (keys) => {
            return this.keyringController.addNewKeyring(simple_1.Simple.type, keys);
        };
        this.keyringController['addEd25519'] = addEd25519;
        this.keyringController['addSecp256k1'] = addSecp256k1;
        return this.keyringController;
    }
    async createVault(password, seed) {
        if (seed) {
            return this.keyringController.createNewVaultAndRestore(password, seed);
        }
        return this.keyringController.createNewVaultAndKeychain(password);
    }
}
exports.WalletController = WalletController;
//# sourceMappingURL=controller.js.map