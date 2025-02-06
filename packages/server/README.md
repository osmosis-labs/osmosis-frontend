# @osmosis-labs/server

This package contains all server-side querying logic and clients.

It exports queries for the Osmosis (or Cosmos) node(s), as well as Osmosis indexer and sidecar services.

It also exports tRPC routers composed of these queries, which can be used to create tRPC contexts.

These queries and utils have minimal dependencies and can be run in the browser, Node.js, or Vercel (or other) edge runtimes.

## Queries

### Node

Queries for Osmosis modules and base Comet BFT modules on other chains via given Chain list.

### Indexer

This module contains raw queries for accessing indexing services for the Osmosis chain, which includes historical data.

### Complex

The folder composes the above queries into more complex query functions. It also includes in memory and remote caching of function return values.

## Utils

Various utils for working queries and tRPC. All utils are compatible with popular edge runtimes:

- Batching queries
- Utils for common Osmosis types:
  - Superjson transformers
- Async utils, such as timeouts
- Remote cache client for Vercel KV
- Search
- Pagination via tRPC & React Queries infinite query (cursor-based)
- Error handling and reporting via Opentelemetry
