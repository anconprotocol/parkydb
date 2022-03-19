import composeWithJson from 'graphql-compose-json';

import { IDataBuilder } from './interfaces/IBuilder'
import { IQueryBuilder } from './interfaces/IQuery'

export class GraphqlService implements IDataBuilder, IQueryBuilder {
  async query(data: any): Promise<any> {
    throw new Error('Method not implemented.')
  }
  async build(value: object) {
    // TODO: https://github.com/Soluto/graphql-to-mongodb/blob/4b295371cb38fe9856f59056ef1c4d782752b5e5/examples/graphql-tools/src/schema.ts
    return composeWithJson('Block',value).toSDL()
  }
}
