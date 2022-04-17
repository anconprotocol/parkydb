export declare class WebauthnHardwareAuthenticate {
    private fido2;
    constructor();
    initialize(options: {
        rpId: any;
        rpName: any;
        rpIcon: any;
        attestation?: any;
        authenticatorRequireResidentKey?: any;
        authenticatorUserVerification?: any;
    }): void;
    registrationOptions(username: string, payload: Uint8Array): Promise<any>;
    signData(origin: any, credential: any, challenge: any, payload: Uint8Array, uid: Uint8Array): Promise<any>;
}
