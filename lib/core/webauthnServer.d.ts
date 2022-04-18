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
        cryptoParams?: any;
    }): void;
    registrationOptions(username: string, payload: Uint8Array): Promise<any>;
    signData(origin: any, updatedCreds: any, challenge: any, payload: Uint8Array, uid: Uint8Array, emitPublicKey: (args: any) => Promise<any>): Promise<any>;
}
