# Queries

This folder stores async lru-cached queries on the Next.js server.

## Node Queries

There are `cosmos` and `osmosis` folder that are intended to store node queries in a matching structure to the corresponding chain

## Indexer

Queries indexing services for Osmosis chain, for historical data.

## Complex

This serves as a middle layer between the API server and the raw queries. This is where caching and parameterization is added (such as search, sort, pagination, and filter). It should be directly called by the API server, and should be composed of queries from the outer folders.
