"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Simple = void 0;
const SimpleKeyring = require('eth-simple-keyring');
class Simple extends SimpleKeyring {
    constructor(opts) {
        super();
    }
}
exports.Simple = Simple;
Simple.type = 'Simple';
//# sourceMappingURL=simple.js.map