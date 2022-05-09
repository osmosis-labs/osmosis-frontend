import { QueryResponse } from "@keplr-wallet/stores";

/** This class accepts query data from outside sources. */
export interface HydrateableStore<TData> {
  /** Cancels any outstanding requests and assumes fresh data. */
  hydrate(data: QueryResponse<TData>): void;
}
