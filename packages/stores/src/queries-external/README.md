## External Queries

This folder contains what we call "queries-external" -- or any queries that do not originate from the Osmosis node.

Our ethos is that the frontend should operate gracefully without any of these supplemental queries. These should mainly
be queries that are not essential and improve the UX in some way; APRs, performance-optimized queries/proxy queries, historical data user account, historical price data, etc.

### Creating an External Query

1. Create a new folder in this directory with the concise name of your query.
2. Define the query either in the index file if it's the only one, or a more specifically named file if there are multiple.
3. Add the query to the `index.ts` file in this directory.
4. Add a types file for the data shape, as well as any externally exportable types.
5. Create a query that extends the `ObservableQueryExternalBase` class. This class simply creates the Axios instance passed to Keplr team's base query class that is used to handle the request. Includes caching, activation, invalidation, etc.
   > 💡 If your query is a "Map" query, as in it has varying parameters (example: query a pool by ID), create an additional parent class that extends the HasMapStore that will automatically create a new store for each requested parameter(s). You may need to de/serialize a string key if there's more than one parameter.
6. Add your query or map query to the store.ts file to be used by the depending package.
