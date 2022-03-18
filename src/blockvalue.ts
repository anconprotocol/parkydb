import { CID } from "multiformats";
import { Block } from "multiformats/block";

export interface BlockValue{
    cid: CID
    dag: Block<any>
    jsonschema: string
    graphqls: string
    index: any
    merklejson: any
}