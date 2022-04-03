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
  private keyringController: any
  constructor() {}

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

  get wallet(): AccountWallet {
    const addEd25519 = async (keys: Array<string>) => {
      return this.keyringController.addNewKeyring(Ed25519.type, keys)
    }
    const addSecp256k1 = async (keys: Array<string>) => {
      return this.keyringController.addNewKeyring(Simple.type, keys)
    }
    this.keyringController['addEd25519'] = addEd25519
    this.keyringController['addSecp256k1'] = addSecp256k1

    return this.keyringController
  }

  async createVault(password: string, seed?: string) {
    if (seed) {
      return this.keyringController.createNewVaultAndRestore(password, seed)
    }
    return this.keyringController.createNewVaultAndKeychain(password)
  }
}
