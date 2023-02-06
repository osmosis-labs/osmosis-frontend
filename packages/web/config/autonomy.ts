export const SUBQUERY_ENDPOINTS: { [chainId: string]: string } = {
  "osmosis-1": "",
  "osmo-test-4":
    "https://api.subquery.network/sq/Autonomy-Network/osmosis-testnet",
};

export const REGISTRY_ADDRESSES: { [chainId: string]: string } = {
  "osmosis-1": "",
  "osmo-test-4":
    "osmo1zynr26u48vdjrcuxkgswfhcx4zh5lw58qshzycykf33p7fp5y32qkydwrp",
};

export const WRAPPER_ADDRESSES: { [chainId: string]: string } = {
  "osmosis-1": "",
  "osmo-test-4":
    "osmo1dwpdh2clk7c8csf9ql2xj36336xsryyg4j7622jhaert9htp48gsh8u9ve",
};
export const ENABLE_AUTONOMY =
  process.env.NEXT_PUBLIC_ENABLE_AUTONOMY === "enabled";
