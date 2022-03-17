export interface IDataBuilder{
    build(data: any): Promise<any>;
}