import * as ed from '@noble/ed25519'
const type = 'Ed25519'

export class Ed25519Keyring {
  type: string
  _wallets: { privateKey: Buffer; publicKey: Uint8Array }[]
  constructor(opts: any) {
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
    const newWallets: { privateKey: Buffer; publicKey: Uint8Array }[] = []
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
  async signTransaction(address, tx, opts = {}) {
    throw new Error('unimplemented')
  }

  // For eth_sign, we need to sign arbitrary data:
  async signMessage(address, data, opts = {}) {
    const message = ethUtil.stripHexPrefix(data)
    const privKey = this._getPrivateKeyFor(address, opts)
    const msgSig = ethUtil.ecsign(Buffer.from(message, 'hex'), privKey)
    const rawMsgSig = concatSig(msgSig.v, msgSig.r, msgSig.s)
    return rawMsgSig
  }

  // For personal_sign, we need to prefix the message:
  async signPersonalMessage(address, msgHex, opts = {}) {
    const privKey = this._getPrivateKeyFor(address, opts)
    const privateKey = Buffer.from(privKey, 'hex')
    const sig = personalSign({ privateKey, data: msgHex })
    return sig
  }

  // For eth_decryptMessage:
  async decryptMessage(withAccount, encryptedData) {
    const wallet = this._getWalletForAccount(withAccount)
    const privateKey = ethUtil.stripHexPrefix(wallet.privateKey)
    const sig = decrypt({ privateKey, encryptedData })
    return sig
  }

  // personal_signTypedData, signs data along with the schema
  async signTypedData(
    withAccount,
    typedData,
    opts = { version: SignTypedDataVersion.V1 },
  ) {
    throw new Error('unimplemented')
  }

  // get public key for nacl
  async getEncryptionPublicKey(withAccount, opts = {}) {
    const privKey = this._getPrivateKeyFor(withAccount, opts)
    const publicKey = getEncryptionPublicKey(privKey)
    return publicKey
  }

  _getPrivateKeyFor(address, opts = {}) {
    if (!address) {
      throw new Error('Must specify address.')
    }
    const wallet = this._getWalletForAccount(address, opts)
    return wallet.privateKey
  }

  // returns an address specific to an app
  async getAppKeyAddress(address, origin) {
    if (!origin || typeof origin !== 'string') {
      throw new Error(`'origin' must be a non-empty string`)
    }
    const wallet = this._getWalletForAccount(address, {
      withAppKeyOrigin: origin,
    })
    const appKeyAddress = normalize(
      ethUtil.publicToAddress(wallet.publicKey).toString('hex'),
    )
    return appKeyAddress
  }

  // exportAccount should return a hex-encoded private key:
  async exportAccount(address, opts = {}) {
    const wallet = this._getWalletForAccount(address, opts)
    return wallet.privateKey.toString('hex')
  }

  removeAccount(address) {
    if (
      !this._wallets
        .map(({ publicKey }) =>
          ethUtil.bufferToHex(ethUtil.publicToAddress(publicKey)).toLowerCase(),
        )
        .includes(address.toLowerCase())
    ) {
      throw new Error(`Address ${address} not found in this keyring`)
    }

    this._wallets = this._wallets.filter(
      ({ publicKey }) =>
        ethUtil
          .bufferToHex(ethUtil.publicToAddress(publicKey))
          .toLowerCase() !== address.toLowerCase(),
    )
  }

  /**
   * @private
   */
  _getWalletForAccount(account, opts = {}) {
    const address = normalize(account)
    let wallet = this._wallets.find(
      ({ publicKey }) =>
        ethUtil.bufferToHex(ethUtil.publicToAddress(publicKey)) === address,
    )
    if (!wallet) {
      throw new Error('Simple Keyring - Unable to find matching address.')
    }

    return wallet
  }
}
