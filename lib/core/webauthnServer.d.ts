import { Fido2Lib } from 'fido2-lib';
export declare class WebauthnHardwareAuthenticate {
    private fido2;
    constructor(fido2: Fido2Lib);
    initialize(options: {
        rpId: any;
        rpName: any;
        rpIcon: any;
    }): void;
    registrationOptions(): Promise<any>;
    register(request: any): Promise<any>;
    verifyOptions(): Promise<import("fido2-lib").PublicKeyCredentialRequestOptions>;
    verify(verifyReq: {
        challenge: any;
        userHandle: any;
        credential: any;
        publicKey: any;
        prevCounter: any;
    }): Promise<boolean>;
}
