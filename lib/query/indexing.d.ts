import { IDataBuilder } from '../parkydb-interfaces/interfaces/IBuilder';
import { IQueryBuilder } from '../parkydb-interfaces/interfaces/IQuery';
export declare class IndexService implements IDataBuilder, IQueryBuilder {
    private currentIndex?;
    constructor(currentIndex?: any);
    load(key: any, data: any): Promise<any>;
    query(q: any): Promise<any>;
    build(value: object, kvstore: any): Promise<any>;
}
