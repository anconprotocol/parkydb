import WalletConnectProvider from '@walletconnect/web3-provider';
interface Signer {
    signature: string;
    digest?: string;
}
export declare class AnconService {
    private provider;
    private rpc;
    constructor(provider: WalletConnectProvider, rpc: string);
    sign(data: any): Promise<Signer>;
    createDid(did: {
        ethrdid?: string;
        did?: string;
    }, pubkey: any, message?: any, customSigner?: (message: any) => Promise<Signer>): Promise<any>;
    createDagBlock(from: string, options: {
        topic: string;
        message: string;
    }, customSigner?: (message: any) => Promise<Signer>): Promise<any>;
}
export {};
