import * as ed from '@noble/ed25519'
const SimpleKeyring = require('eth-simple-keyring')

export class Simple extends SimpleKeyring {
  static type: string = 'Simple'
  constructor(opts: any) {
    super()
  }
}
