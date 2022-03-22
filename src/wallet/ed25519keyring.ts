import * as ed from '@noble/ed25519'
import EventEmitter from 'eventemitter3'
const type = 'Ed25519'

export class Ed25519Keyring extends EventEmitter {
  type: string
  _wallets: { privateKey: Uint8Array; publicKey: Uint8Array }[]
  constructor(opts: any) {
    super()
    this.type = type
    this._wallets = []
    this.deserialize(opts)
  }

  async serialize() {
    return this._wallets.map(({ privateKey }) => privateKey)
  }

  async deserialize(privateKeys = []) {
    this._wallets = await Promise.all(
      privateKeys.map(async (key: string) => {
        const privateKey = Buffer.from(key, 'hex')
        const publicKey = await ed.getPublicKey(privateKey)
        return { privateKey, publicKey }
      }),
    )
  }

  async addAccounts(n = 1) {
    const newWallets: { privateKey: Uint8Array; publicKey: Uint8Array }[] = []
    for (let i = 0; i < n; i++) {
      const privateKey = ed.utils.randomPrivateKey()
      const publicKey = await ed.getPublicKey(privateKey)
      newWallets.push({ privateKey, publicKey })
    }
    this._wallets = this._wallets.concat(newWallets)
    const hexWallets = newWallets.map(({ publicKey }) =>
      ed.utils.bytesToHex(publicKey),
    )
    return hexWallets
  }

  async getAccounts() {
    return this._wallets.map(({ publicKey }) => ed.utils.bytesToHex(publicKey))
  }

  // tx is an instance of the ethereumjs-transaction class.
  async signTransaction(address: any, tx: any, opts = {}) {
    throw new Error('unimplemented')
  }

  // For eth_sign, we need to sign arbitrary data:
  async signMessage(address: any, data: any, opts = {}) {
    // const message = ethUtil.stripHexPrefix(data)
    const privKey = this._getPrivateKeyFor(address, opts)
    return ed.sign(data, privKey)
  }

  // For personal_sign, we need to prefix the message:
  async signPersonalMessage(address: any, msgHex: any, opts = {}) {
    throw new Error('unimplemented')
  }

  // For eth_decryptMessage:
  async decryptMessage(withAccount: any, encryptedData: any) {
    throw new Error('unimplemented')
  }

  // personal_signTypedData, signs data along with the schema
  async signTypedData(withAccount: any, typedData: any, opts = {}) {
    throw new Error('unimplemented')
  }

  // get public key for nacl
  async getEncryptionPublicKey(withAccount: any, opts = {}) {
    throw new Error('unimplemented')
  }

  _getPrivateKeyFor(address: any, opts = {}) {
    if (!address) {
      throw new Error('Must specify address.')
    }
    const wallet = this._getWalletForAccount(address, opts)
    return wallet.privateKey
  }

  // returns an address specific to an app
  async getAppKeyAddress(address: any, origin: string) {
    if (!origin || typeof origin !== 'string') {
      throw new Error(`'origin' must be a non-empty string`)
    }
    const wallet = this._getWalletForAccount(address, {
      withAppKeyOrigin: origin,
    })
    return ed.utils.bytesToHex(wallet.publicKey)
  }

  // exportAccount should return a hex-encoded private key:
  async exportAccount(address: any, opts = {}) {
    const wallet = this._getWalletForAccount(address, opts)
    return ed.utils.bytesToHex(wallet.privateKey)
  }

  removeAccount(address: any) {
    if (
      !this._wallets
        .map(({ publicKey }) => ed.utils.bytesToHex(publicKey))
        .includes(address.toLowerCase())
    ) {
      throw new Error(`Address ${address} not found in this keyring`)
    }

    this._wallets = this._wallets.filter(
      ({ publicKey }) =>
        ed.utils.bytesToHex(publicKey).toLowerCase() !== address.toLowerCase(),
    )
  }

  /**
   * @private
   */
  _getWalletForAccount(account: any, opts = {}) {
    let wallet = this._wallets.find(
      ({ publicKey }) => ed.utils.bytesToHex(publicKey) === account,
    )
    if (!wallet) {
      throw new Error('Simple Keyring - Unable to find matching address.')
    }

    return wallet
  }
}
