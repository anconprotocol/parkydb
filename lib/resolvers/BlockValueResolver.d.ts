import 'reflect-metadata';
import { DBBlockValue } from '../parkydb-interfaces/interfaces/Blockvalue';
import { ServiceContext } from '../parkydb-interfaces/interfaces/ServiceContext';
declare class BlocksArgs {
    query: any;
    limit: number;
}
export declare class BlockValueResolver {
    block(cid: string, ctx: ServiceContext): Promise<DBBlockValue>;
    blocks({ query, limit }: BlocksArgs, ctx: ServiceContext): Promise<any>;
}
export {};
