import { createInnerTRPCContext } from "@osmosis-labs/trpc";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { getOpentelemetryServiceName } from "~/utils/service-name";

/** tRPC context for Next.js endpoints. */
export const createNextTrpcContext = (_opts: CreateNextContextOptions) => {
  return createInnerTRPCContext({
    assetLists: AssetLists,
    chainList: ChainList,
    opentelemetryServiceName: getOpentelemetryServiceName(),
  });
};

/** tRPC context for Next.js endpoints running on Vercel's edge runtime. */
export const createEdgeTrpcContext = (_opts: FetchCreateContextFnOptions) => {
  return createInnerTRPCContext({
    assetLists: AssetLists,
    chainList: ChainList,
    opentelemetryServiceName: getOpentelemetryServiceName(),
  });
};
