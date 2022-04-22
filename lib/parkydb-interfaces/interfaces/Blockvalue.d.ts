import { Block } from 'multiformats/block';
import { Document } from './StorageKind';
export interface Schemas {
    jsonschema: string;
    graphqls: string;
    ipld?: string;
    pb?: string;
}
export interface BlockValue {
    cid: string;
    dag: Block<any>;
    document: object;
    uuid: string;
    timestamp: number;
}
export declare class DBBlockValue {
    cid: string;
    document: Document;
    timestamp: number;
}
