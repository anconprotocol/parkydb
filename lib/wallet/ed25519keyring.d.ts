declare const SimpleKeyring: any;
export declare class Ed25519 extends SimpleKeyring {
    static type: string;
    _wallets: {
        privateKey: Uint8Array;
        publicKey: Uint8Array;
    }[];
    constructor(opts: any);
    serialize(): Promise<Uint8Array[]>;
    deserialize(privateKeys?: never[]): Promise<void>;
    addAccounts(n?: number): Promise<string[]>;
    getAccounts(): Promise<string[]>;
    signTransaction(address: any, tx: any, opts?: {}): Promise<void>;
    signMessage(address: any, data: any, opts?: {}): Promise<Uint8Array>;
    signPersonalMessage(address: any, msgHex: any, opts?: {}): Promise<void>;
    decryptMessage(withAccount: any, encryptedData: any): Promise<void>;
    signTypedData(withAccount: any, typedData: any, opts?: {}): Promise<void>;
    getEncryptionPublicKey(withAccount: any, opts?: {}): Promise<void>;
    _getPrivateKeyFor(address: any, opts?: {}): Uint8Array;
    getAppKeyAddress(address: any, origin: string): Promise<string>;
    exportAccount(address: any, opts?: {}): Promise<string>;
    removeAccount(address: any): void;
    _getWalletForAccount(account: any, opts?: {}): {
        privateKey: Uint8Array;
        publicKey: Uint8Array;
    };
}
export {};
