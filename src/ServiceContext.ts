import Dexie from 'dexie';
import { DocumentNode } from 'graphql';

export interface ServiceContext {
  request: any;
  db: Dexie;
  variables: any;
  operationName: string | undefined;
  query: string | DocumentNode | undefined;
}
