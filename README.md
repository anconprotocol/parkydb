# Ancon ParkyDB - A data mesh database using Web 3.0 technology 

>Note: Requires Node v17.7.2 and up for development

More about [data mesh architecture](https://www.datamesh-architecture.com/) 

![ParkyDB (2)](https://user-images.githubusercontent.com/1248071/159067543-a3afb7dd-c3e0-45f8-be96-9ff20083f488.png)

![ParkyDB (1)](https://user-images.githubusercontent.com/1248071/159067544-593fa50f-9125-4266-9b08-c58f44bd7d5c.png)

## Block based data layered abstraction

### IndexedDB (KV Layer - Layer 0)

Stores key as cid or custom (topic) and values in the layered approached with a schema similar to:

```
{
   "key": "cid",
   "dag": ...blob...,
   "db": ...blob...,
   "index:": ...blob...,
   "gqls": ...blob...,
   "jsonschema": ...blob...
}
```

### DAG  (Linkable and Verifiable Layer - Layer 1)  

Stores as an IPLD Multiformats DAG Block. Input must be a JSON payload. Can support either CBOR or JSON. This layer keeps data immutable (no mutations allowed) and uses special directives with query layer.

### Document (Document Layer - Layer 2) 

Stores as a JSON. Input must be a JSON payload. Used for queries only and represents a snapshot of the immutable data in DAG.

### Index (Query and index Layer - Layer 3)  

Stores as a Minisearch filter index. Input must be JSON payload. Used for search only and represents the JSON payload index, the `@filter` GraphQL directive will enable filtering.

### GraphQL Schema (Query and index Layer - Layer 3)  

Stores a GraphQL Schema. Used with on-demand GraphQL APIs that enables querying the DB and Index layer. Mutations are immutable PUTs in DAG. It also integrates different GraphQL stores using Mesh and appends the data as blocks in the database.

### JSON Schema (Verifiable Document Layer - Layer 4)

Stores a JSON Schema. Used to create `Verifiable Data Document`  dapps which  might contain or required ERC-721 / Verified Credential compatible schemas. This feature is used for data publishing exclusively.

### Protobuf Schema (Messaging Layer - Layer 5)

Stores a Protobuf Schema. Used to integrate data library with Waku and decentralized full nodes


## API v0.1.0

### Store

```typescript
import { ParkyDB } from 'parkydb'

// Instantiate new DB instance
const db = new ParkyDB()
await db.initialize()

// Writes a DAG JSON block
const id = await db.putBlock(payload)

// Fetch an existing DAG block
const res = await db.get(id)

// Queries with GraphQL a JSON snapshot of the DAG block
const q = await db.query({
    cid: id,
    query: `
    query{
       block(cid: "${id}") {
         network
         key
       }
    }   
    `,
  })
```