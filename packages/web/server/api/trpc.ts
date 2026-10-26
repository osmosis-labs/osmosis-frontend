import { createInnerTRPCContext } from "@osmosis-labs/trpc";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";

/** tRPC context for the Fetch API handlers in `server/api-handlers`. */
export const createTrpcContext = (_opts: FetchCreateContextFnOptions) => {
  return createInnerTRPCContext({
    assetLists: AssetLists,
    chainList: ChainList,
  });
};
