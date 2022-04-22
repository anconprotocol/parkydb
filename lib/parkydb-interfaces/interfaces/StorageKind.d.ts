export declare class Document {
    kind: string;
    tag: string;
    ref: string;
}
export declare class StorageAsset extends Document {
    name: string;
    kind: string;
    timestamp: number;
    description: string;
    image: string;
    sources: string[];
    owner: string;
}
export declare class StorageBlock extends Document {
    content: StorageAsset;
    signature: string;
    digest: string;
    timestamp: number;
    issuer: string;
}
export declare class IPFSBlock extends Document {
    cid: string;
}
export declare class ConfigBlock extends Document {
    entries: string;
}
export declare class AddressBlock extends Document {
    address: string;
    resolver: string;
    type: 'erc20' | 'erc721' | 'smart contract' | 'eoa' | 'uri' | 'phone' | 'email' | 'gps' | 'did' | 'ens';
}
export declare class AnconBlock extends Document {
    cid: string;
    topic: string;
}
export declare class ERC721Block extends Document {
    txid: string;
    metadata: string;
    tokenAddress: string;
    tokenId: string;
    chainId: string;
    minterAddress: string;
    ownerAddress: string;
}
