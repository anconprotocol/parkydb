import { WebauthnHardwareAuthenticate } from './webauthnServer';
export declare class WebauthnHardwareClient {
    private server;
    constructor(server: WebauthnHardwareAuthenticate);
    register(origin: any, username: string, displayName: string, payload: Uint8Array): Promise<any>;
}
