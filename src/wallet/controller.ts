import { Ed25519Keyring } from './ed25519keyring'

const KeyringController = require('eth-keyring-controller')
const HD = require('eth-hd-keyring')

export class WalletController {
  keyringController: any;
  constructor() {
    this.keyringController = new KeyringController({
      keyringTypes: [HD, Ed25519Keyring], // optional array of types to support.
    //  initState: initState.KeyringController, // Last emitted persisted state.
      // encryptor: {
      //   // An optional object for defining encryption schemes:
      //   // Defaults to Browser-native SubtleCrypto.
      //   encrypt(password, object) {
      //     return new Promise('encrypted!');
      //   },
      //   decrypt(password, encryptedString) {
      //     return new Promise({ foo: 'bar' });
      //   },
      // },
    })
  }

  async createVault(password: string){
    await this.keyringController.createNewVaultAndKeychain(password);
    await this.keyringController.persistAllKeyrings();
  }
}