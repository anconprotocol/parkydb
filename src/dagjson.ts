import * as Block from 'multiformats/block'
import * as codec from '@ipld/dag-json'
import { sha256 as hasher } from 'multiformats/hashes/sha2'
  import { IDataBuilder } from './IBuilder'

  export class DAGJsonService implements IDataBuilder {
    async build(value: object) {
      // encode a block
      let block = await Block.encode({ value, codec, hasher })

      return block
      // // you can also decode blocks from their binary state
      // block = await Block.decode({ bytes: block.bytes, codec, hasher })

      // // if you have the cid you can also verify the hash on decode
      // block = await Block.create({ bytes: block.bytes, cid: block.cid, codec, hasher })  }
    }
  }
