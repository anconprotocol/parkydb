import { IDataBuilder } from '../interfaces/IBuilder';
export declare class JsonSchemaService implements IDataBuilder {
    build(value: object): Promise<any>;
}
