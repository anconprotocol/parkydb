import Dexie from 'dexie';
import { DocumentNode } from 'graphql';
import { ParkyDB } from '../../core/db';
import { BlockValue } from './Blockvalue';

export interface ServiceContext {
  db: ParkyDB;
  id: string;
  state: BlockValue;
  variables: any;
  operationName: string | undefined;
  query: string | DocumentNode | undefined;
}
