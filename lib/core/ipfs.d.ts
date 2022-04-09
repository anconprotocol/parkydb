export declare class IPFSService {
    private gateway;
    private rpc;
    constructor(gateway: string, rpc: string);
    uploadFile(content: File): Promise<{
        image: string;
        cid: any;
        error: boolean;
    }>;
}
