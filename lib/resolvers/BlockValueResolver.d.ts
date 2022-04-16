import 'reflect-metadata';
import { DBBlockValue } from '../interfaces/Blockvalue';
import { ServiceContext } from '../interfaces/ServiceContext';
declare class BlocksArgs {
    query: any;
    limit: number;
}
export declare class BlockValueResolver {
    block(cid: string, ctx: ServiceContext): Promise<DBBlockValue>;
    blocks({ query, limit }: BlocksArgs, ctx: ServiceContext): Promise<import("dexie").Observable<unknown>>;
}
export {};
