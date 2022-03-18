# Ancon Data Agent Library

![Screenshot from 2022-03-17 20-59-57](https://user-images.githubusercontent.com/1248071/158923256-402ad72f-2161-439e-b675-3b5730c54853.png)

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

### DAG  (Verifiable Layer - Layer 1)  

Stores as an IPLD Multiformats DAG Block. Input must be a JSON payload. Can support either CBOR or JSON. This layer keeps data immutable (no mutations allowed).

### DB (Entity Relational Layer - Layer 2) 

Stores as a SQLite DB as binary. Input must be a JSON payload. Used for queries only and represents a snapshot of the immutable data in DAG.

### Index (Index Layer - Layer 3)  

Stores as a Lunr/Lucene or Bloom filter index. Input must be JSON payload. Used for search only and represents the JSON payload index.

### GraphQL Schema (Query/Mutation Layer - Layer 4)

Stores a GraphQL Schema. Used with on-demand GraphQL APIs that enables querying the DB and Index layer. Mutations are immutable PUTs in DAG.

### JSON Schema (Document Layer - Layer 5)

Stores a JSON Schema. Used to create `Verifiable Data Document`  dapps which  might contain or required ERC-721 / Verified Credential compatible schemas. This feature is used for data publishing exclusively.

### Protobuf Schema (Messaging Layer - Layer 6)

Stores a Protobuf Schema. Used to integrate data library with Waku.

