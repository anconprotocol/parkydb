import 'reflect-metadata';
import { DBBlockValue } from 'parkydb-interfaces';
import { ServiceContext } from 'parkydb-interfaces';
declare class BlocksArgs {
    query: any;
    limit: number;
}
export declare class BlockValueResolver {
    block(cid: string, ctx: ServiceContext): Promise<DBBlockValue>;
    blocks({ query, limit }: BlocksArgs, ctx: ServiceContext): Promise<any>;
}
export {};
