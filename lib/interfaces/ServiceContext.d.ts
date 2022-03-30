import Dexie from 'dexie';
import { DocumentNode } from 'graphql';
import { BlockValue } from './Blockvalue';
export interface ServiceContext {
    db: Dexie;
    id: string;
    state: BlockValue;
    variables: any;
    operationName: string | undefined;
    query: string | DocumentNode | undefined;
}
