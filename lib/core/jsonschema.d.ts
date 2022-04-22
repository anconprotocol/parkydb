import { IDataBuilder } from 'parkydb-interfaces';
export declare class JsonSchemaService implements IDataBuilder {
    build(value: object): Promise<any>;
}
