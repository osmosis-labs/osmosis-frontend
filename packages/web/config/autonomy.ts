export const SUBQUERY_ENDPOINTS: { [chainId: string]: string } = {
  "osmosis-1": "",
  "osmo-test-4":
    "https://api.subquery.network/sq/0xlook/autonomy-osmosis-subql",
};

export const REGISTRY_ADDRESSES: { [chainId: string]: string } = {
  "osmosis-1": "",
  "osmo-test-4":
    "osmo1yx3jsxdxq6lg6qm5yfl8aars7ye33x2hasnpqtwmu79mfzumqqjsdl54sh",
};

export const WRAPPER_ADDRESSES: { [chainId: string]: string } = {
  "osmosis-1": "",
  "osmo-test-4":
    "osmo1zkgtuakfpxw00m7rn0e2aphtxe34znr2ewajr04ch6h4usmcf6tqdhvejw",
};
export const ENABLE_AUTONOMY =
  process.env.NEXT_PUBLIC_ENABLE_AUTONOMY === "enabled";
