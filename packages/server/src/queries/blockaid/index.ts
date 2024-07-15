export * from "./transaction";

export const blockaidAuthHeaders: HeadersInit | undefined = process.env
  .BLOCKAID_API_KEY
  ? {
      "x-api-key": process.env.BLOCKAID_API_KEY,
    }
  : undefined;
