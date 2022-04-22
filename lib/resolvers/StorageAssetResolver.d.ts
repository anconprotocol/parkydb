import 'reflect-metadata';
import { ServiceContext } from 'parkydb-interfaces';
declare class StorageAssetArgs {
    limit: number;
}
export declare class StorageAssetResolver {
    asset(id: string, ctx: ServiceContext): Promise<any>;
    assets({ limit }: StorageAssetArgs, ctx: ServiceContext): Promise<any>;
}
export {};
