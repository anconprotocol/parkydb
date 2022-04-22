const toJsonSchema = require('to-json-schema')
import { IDataBuilder } from '../parkydb-interfaces/interfaces/IBuilder'

export class JsonSchemaService implements IDataBuilder {
  async build(value: object) {
    return toJsonSchema(value);
  }
}
