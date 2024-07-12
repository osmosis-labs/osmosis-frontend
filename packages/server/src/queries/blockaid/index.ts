export * from "./transaction";

export const BASE_URL = process.env.BLOCKAID_BASE_URL;

export const blockaidAuthHeaders: HeadersInit | undefined = process.env
  .BLOCKAID_API_KEY
  ? {
      "x-api-key": process.env.BLOCKAID_API_KEY,
    }
  : undefined;
