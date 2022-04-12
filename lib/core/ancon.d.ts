import WalletConnectProvider from '@walletconnect/web3-provider';
export declare class AnconService {
    private provider;
    private rpc;
    constructor(provider: WalletConnectProvider, rpc: string);
    sign(data: any): Promise<{
        digest: string;
        signature: any;
    }>;
    createDid(pubkey: any): Promise<any>;
    createDagBlock(options: {
        topic: string;
        message: string;
    }): Promise<any>;
}
