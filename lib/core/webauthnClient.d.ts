import { ParkyDB } from './db';
import { WebauthnHardwareAuthenticate } from './webauthnServer';
export declare class WebauthnHardwareClient {
    private server;
    private db;
    constructor(server: WebauthnHardwareAuthenticate, db: ParkyDB);
    registerSign(origin: any, username: string, displayName: string, payload: Uint8Array, emitPublicKey: (args: any) => Promise<any>, isMobile: boolean, keepSigning?: boolean): Promise<any>;
}
