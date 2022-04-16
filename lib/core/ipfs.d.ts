export declare class IPFSService {
    private gateway;
    private rpc;
    constructor(gateway: string, rpc: string);
    uploadFile(content: any): Promise<{
        image: string;
        cid: any;
        error: boolean;
    }>;
}
