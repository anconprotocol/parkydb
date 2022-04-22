export interface IQueryBuilder {
    query(ctx: any, options?: any): Promise<any>;
}
