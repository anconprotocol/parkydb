const toJsonSchema = require('to-json-schema')
import { IDataBuilder } from './IBuilder'

export class JsonSchemaService implements IDataBuilder {
  async build(value: object) {
    return toJsonSchema(value);
  }
}
