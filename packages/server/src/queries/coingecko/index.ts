export * from "./coin";
export * from "./list";
export * from "./market-chart";
export * from "./price";
export * from "./search";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

export const PRICES_API_URL = process.env.COINGECKO_API_KEY
  ? "https://prices.osmosis.zone"
  : COINGECKO_API_URL;
export const DETAILS_API_URL = process.env.COINGECKO_API_KEY
  ? "https://coingecko.osmosis.zone"
  : COINGECKO_API_URL;

/**
 * Auth headers for local development, it's required from "DETAILS_API_URL",
 * because there is a white list of domain that are allowed to do GET requests on that domain.
 */
export const authHeaders: HeadersInit | undefined = process.env
  .COINGECKO_API_KEY
  ? {
      "X-API-KEY": process.env.COINGECKO_API_KEY,
    }
  : undefined;
