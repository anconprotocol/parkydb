import { Block } from 'multiformats/block';
import { IDataBuilder } from '../parkydb-interfaces/interfaces/IBuilder';
import { IQueryBuilder } from '../parkydb-interfaces/interfaces/IQuery';
export declare class DocumentService implements IDataBuilder, IQueryBuilder {
    private currentIndex?;
    constructor(currentIndex?: any);
    load(key: any, data: any): Promise<any>;
    query(q: any): Promise<any>;
    build(value: Block<any>, kvstore?: any): Promise<any>;
}
