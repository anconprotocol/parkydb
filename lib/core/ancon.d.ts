import WalletConnectProvider from '@walletconnect/web3-provider';
export declare class AnconService {
    private provider;
    private pubkey;
    private rpc;
    constructor(provider: WalletConnectProvider, pubkey: string, rpc: string);
    sign(data: any): Promise<{
        digest: string;
        signature: any;
    }>;
    createDid(): Promise<any>;
    createDagBlock(options: {
        topic: string;
        message: string;
    }): Promise<any>;
}
