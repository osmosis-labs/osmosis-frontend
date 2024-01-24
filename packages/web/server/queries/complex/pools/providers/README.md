# Pools Providers

Querying pools and supplementary pool data is data-intensive. This is why we have multiple potential providers of pool data with varying tradeoffs.

This folder provides a file where each provider is queried and its data processed in tandem with our frontend asset list.

The actual provider used is determined by the provider that's passed to the `getPools` function in parent index file.

### Providers at time of writing:

- Sidecar: queries real-time pools from node's sidecar service, which includes balances making it faster.
- Imperator: queries pools from centralized indexer service, which includes balances as well as some historical market metric data (TVL, volume, etc) making it the fastest. However, some pools may be excluded if the indexer's asset list is not up to date.
