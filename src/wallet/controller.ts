import { Ed25519 } from './ed25519keyring'

const KeyringController = require('eth-keyring-controller')
const SimpleKeyring = require('eth-simple-keyring')

export class WalletController {
  private keyringController: any
  constructor() {
  }

  load(vaultStorage: any = {}) {
    this.keyringController = new KeyringController({
      keyringTypes: [Ed25519, SimpleKeyring],
      initState: vaultStorage      
    })    
  }

  get wallet() {
    return this.keyringController
  }
 
  async createVault(password: string, seed?: string) {
    if (seed) {
      await this.keyringController.createNewVaultAndRestore(password, seed)
    }
    await this.keyringController.createNewVaultAndKeychain(password)
  }
}
