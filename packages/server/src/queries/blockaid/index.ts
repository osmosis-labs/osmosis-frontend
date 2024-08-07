import { BLOCKAID_API_KEY } from "../../env";

export * from "./transaction";

export const blockaidAuthHeaders: HeadersInit | undefined = BLOCKAID_API_KEY
  ? {
      "x-api-key": BLOCKAID_API_KEY,
    }
  : undefined;
