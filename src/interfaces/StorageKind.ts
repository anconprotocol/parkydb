// Metadata asset - Store locally
export interface StorageAsset {
    name: string;
    kind: string;
    timestamp: number;
    description: string;
    image: string;
    sources: string[];
    owner: string;
}

// Storage block - Web3 + Topic
export interface StorageBlock {
    content: StorageAsset | string;
    kind: string;
    signature: string; // Either Waku+Web3 EIP712 or eth_signMessage
    digest: string;
    timestamp: number;
    issuer: string;
}

// Ancon Node block - Public
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
