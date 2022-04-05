import Dexie from 'dexie'
import { Ed25519 } from './ed25519keyring'
import { IKeyringController } from '../interfaces/IKeyringController'
import { Simple } from './simple'
const KeyringController = require('eth-keyring-controller')

interface AccountWallet {
  exportAccount(from: string): Promise<string>
  getAccounts(): Promise<string>
  addEd25519(keys: string[]): Promise<any>
  addSecp256k1(keys: string[]): Promise<any>
}

export class WalletController implements IKeyringController {
  
  constructor(public keyringController?: any) {}

  async load(vaultStorage: Dexie | any) {
    let kr = await vaultStorage.keyring.get({ id: 1 })
    kr = kr || {}

    this.keyringController = new KeyringController({
      keyringTypes: [Ed25519, Simple],
      initState: kr.keyring || {},
    })
    this.keyringController.store.subscribe(async (state: any) => {
      await vaultStorage.keyring.put({ id: 1, keyring: state }, 1)
    })
  }


  async createVault(password: string, seed?: string) {
    if (seed) {
      return this.keyringController.createNewVaultAndRestore(password, seed)
    }
    return this.keyringController.createNewVaultAndKeychain(password)
  }
}
