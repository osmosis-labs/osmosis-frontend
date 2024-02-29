# Queries

This folder stores all server side querying logic for use with tRPC.

## Node Queries

There are `cosmos` and `osmosis` folder that are intended to store node queries in a matching structure to the corresponding chain. This is where the raw queries are stored.

## Indexer

Raw queries for accessing indexing services for Osmosis chain containing historical data.

## Complex

This is a middle layer between the API server and the raw queries. This is where caching (via cachified) and parameterization are added (such as search, sort, pagination, and filter). It should be directly called by the API server and should be composed of queries from the outer folders. For more information, see the README.md file in that folder.
