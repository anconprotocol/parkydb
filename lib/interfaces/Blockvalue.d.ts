import { CID } from 'multiformats';
import { Block } from 'multiformats/block';
import { Document } from './StorageKind';
export interface Schemas {
    jsonschema: string;
    graphqls: string;
    ipld?: string;
    pb?: string;
}
export interface BlockValue {
    cid: CID;
    dag: Block<any>;
    document: object;
    topic?: string;
    schemas: Schemas;
    index: any;
    hashtag: any;
    timestamp: number;
}
export declare class DBBlockValue {
    cid: string;
    document: Document;
    topic?: string;
    index: string;
    hashtag: string;
    timestamp: number;
}
