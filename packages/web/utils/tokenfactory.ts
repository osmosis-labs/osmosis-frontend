/** Tokens sent to this address have no recoverable admin — effectively renounced. */
export const TOKENFACTORY_BURN_ADDRESS =
  "osmo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmcn030";

/** x/gov module account — admin held by on-chain governance. */
export const GOVERNANCE_MODULE_ADDRESS =
  "osmo10d07y265gmmuvt4z0w9aw880jnsr700jjeq4qp";

/** Bech32 pattern for a valid Osmosis address. */
export const OSMO_ADDRESS_REGEX = /^osmo1[a-z0-9]{38}$/;
