const KeyringController = require('eth-keyring-controller');
const SimpleKeyring = require('eth-simple-keyring');

const keyringController = new KeyringController({
  keyringTypes: [SimpleKeyring], // optional array of types to support.
  initState: initState.KeyringController, // Last emitted persisted state.
  encryptor: {
    // An optional object for defining encryption schemes:
    // Defaults to Browser-native SubtleCrypto.
    encrypt(password, object) {
      return new Promise('encrypted!');
    },
    decrypt(password, encryptedString) {
      return new Promise({ foo: 'bar' });
    },
  },
});

// The KeyringController is also an event emitter:
this.keyringController.on('newAccount', (address) => {
  console.log(`New account created: ${address}`);
});
this.keyringController.on('removedAccount', handleThat);