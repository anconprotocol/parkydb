export interface IQueryBuilder{
    query(ctx: any, data: any, options?: any): Promise<any>;
}