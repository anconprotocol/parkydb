export declare class WebauthnHardwareAuthenticate {
    private fido2;
    constructor();
    initialize(options: {
        rpId: any;
        rpName: any;
        rpIcon: any;
    }): void;
    registrationOptions(): Promise<any>;
    register(origin: any, request: any): Promise<any>;
    verifyOptions(): Promise<import("fido2-lib").PublicKeyCredentialRequestOptions>;
    verify(origin: any, verifyReq: {
        challenge: any;
        userHandle: any;
        credential: any;
        publicKey: any;
        prevCounter: any;
    }): Promise<boolean>;
}
