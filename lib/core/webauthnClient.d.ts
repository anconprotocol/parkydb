import { WebauthnHardwareAuthenticate } from './webauthnServer';
export declare class WebauthnHardwareClient {
    private server;
    constructor(server: WebauthnHardwareAuthenticate);
    register(origin: any, username: string, displayName: string): Promise<{
        registerResponse: any;
        credential: {
            rawId: string;
            response: {
                attestationObject: string;
                clientDataJSON: string;
                id: any;
                type: any;
            };
        };
    } | undefined>;
    verify(origin: any, registerResponse: {
        publicKey: string;
        prevCounter: any;
    }, userCredential: any): Promise<any>;
}
