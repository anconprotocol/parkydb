export interface IQueryBuilder{
    query(data: any): Promise<any>;
}