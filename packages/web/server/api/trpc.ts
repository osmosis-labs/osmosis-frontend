import { createInnerTRPCContext } from "@osmosis-labs/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

/** tRPC context for Next.js endpoints. */
export const createNextTrpcContext = (_opts: CreateNextContextOptions) => {
  return createInnerTRPCContext({});
};

/** tRPC context for Next.js endpoints running on Vercel's edge runtime. */
export const createEdgeTrpcContext = (_opts: FetchCreateContextFnOptions) => {
  return createInnerTRPCContext({});
};
