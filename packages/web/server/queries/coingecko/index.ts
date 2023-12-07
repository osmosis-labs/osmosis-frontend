export * from "./detail";
export * from "./price";
export * from "./search";

export const PRICES_API_URL = "https://prices.osmosis.zone";
// TODO: Use public coingecko API for demo
export const DETAILS_API_URL = "https://api.coingecko.com";

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
