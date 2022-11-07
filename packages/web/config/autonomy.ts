export const SUBQUERY_ENDPOINTS: { [chainId: string]: string } = {
  "osmosis-1": "",
  "osmo-test-4":
    "https://api.subquery.network/sq/0xlook/autonomy-osmosis-subql",
};

export const REGISTRY_ADDRESSES: { [chainId: string]: string } = {
  "osmosis-1": "",
  "osmo-test-4":
    "osmo1dhkyxu0g9u6zr3wm3d3s875atnffvr60hg2gnsz80s48j33atmxq3ptp4c",
};

export const WRAPPER_ADDRESSES: { [chainId: string]: string } = {
  "osmosis-1": "",
  "osmo-test-4":
    "osmo16ca3u3l8mrgrmz3u48rrfh7dhf3e9y8d9xrxf3w0lla6xy073v7stz3r4e",
};
export const ENABLE_AUTONOMY =
  process.env.NEXT_PUBLIC_ENABLE_AUTONOMY === "enabled";
