import Dexie from 'dexie'
import { Ed25519 } from './ed25519keyring'
import {IKeyringController} from '../interfaces/IKeyringController'
const KeyringController = require('eth-keyring-controller')
const SimpleKeyring = require('eth-simple-keyring')

export class WalletController implements IKeyringController {
  private keyringController: any
  constructor() {}

  async load(vaultStorage: Dexie | any) {
    let kr = await vaultStorage.keyring.get({ id: 1 })
    kr = kr || {};

    this.keyringController = new KeyringController({
      keyringTypes: [Ed25519, SimpleKeyring],
      initState: kr.keyring || {},
    })
    this.keyringController.store.subscribe(async (state: any) => {
      await vaultStorage.keyring.put({ id: 1, keyring: state })
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
