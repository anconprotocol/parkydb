import 'reflect-metadata';
import { ServiceContext } from '../interfaces/ServiceContext';
declare class StorageAssetArgs {
    limit: number;
}
export declare class StorageAssetResolver {
    asset(id: string, ctx: ServiceContext): Promise<any>;
    assets({ limit }: StorageAssetArgs, ctx: ServiceContext): Promise<import("dexie").Observable<unknown>>;
}
export {};
