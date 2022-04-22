export interface PublicKeyMessage {
    encryptionPublicKey: string;
    ethAddress: string;
    signature: string;
}
export interface SecurePacketPayload {
    payload: any;
    publicKeyMessage: PublicKeyMessage;
}
export interface PacketPayload {
    payload: any;
}
