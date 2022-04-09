export interface StorageAsset {
    name: string;
    kind: string;
    timestamp: number;
    description: string;
    image: string;
    sources: string[];
    owner: string;
}
export interface StorageBlock {
    content: StorageAsset | string;
    kind: string;
    signature: string;
    digest: string;
    timestamp: number;
    issuer: string;
}
export interface VerifiableStorageBlock extends StorageBlock {
    commitHash: string;
    kind: string;
    contentHash: string;
    height: number;
    key: string;
    rootKey: string;
    lastBlockHash: string;
    network: string;
}
