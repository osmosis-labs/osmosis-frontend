# Pools Package

## Pools

The pools package provides the model classes for each type of pool on Osmosis.

Their intention is to be deserialized from the query response, constructed, and used in the router
to calculate the swap amounts and fees. NOTE: some additional data may be needed to construct the pools, such as pool amount balances for CL and Cosmwasm pools.

There are some pools that require utility objects (providers) that can be passed to the pool to provide data to the pool, such tick data for the concentrated liquidity pools. You may create and pass your own providers.

## Router

The router can be used to generate quotes for trades through a given set of pools. The pools just need to implement the `RoutablePool` interface, which is already implemented by all the pools in this package.

Its features include:

- Pool Preferences: specify pool IDs that should be preferred to be routed through, such as the more efficient concentrated liquidity pools. Otherwise, pool fiat liquidity value is used to sort pools.
- Split Routes: it will iteratively search for the ideal split that yields the highest amount of output token.

Swapping in token given out is not yet supported.
