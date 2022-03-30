export interface IDataBuilder {
    build(data: any, kvstore?: any): Promise<any>;
}
