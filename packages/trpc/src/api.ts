import { superjson } from "@osmosis-labs/server";
import { AssetList, Chain } from "@osmosis-labs/types";
import { redactConfiguredEvmRpcUrls, timeout } from "@osmosis-labs/utils";
import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";

/**
 * Pass asset lists and chain list to be used cas context in backend service.
 */
type CreateContextOptions = {
  assetLists: AssetList[];
  chainList: Chain[];
};

/**
 * This helper generates the "internals" for a tRPC context. If we need to use it, we can export
 * it from here.
 *
 * Examples of things we may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return opts;
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors to get typesafety on the frontend if our procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createInnerTRPCContext>().create({
  transformer: superjson,
  allowOutsideOfServer: true,
  errorFormatter({ shape, error }) {
    // Error text can carry a keyed EVM RPC URL (viem includes the request
    // URL in its messages); this is the last point before it reaches a
    // client.
    return {
      ...shape,
      message: redactConfiguredEvmRpcUrls(shape.message),
      data: {
        ...shape.data,
        stack:
          shape.data.stack === undefined
            ? undefined
            : redactConfiguredEvmRpcUrls(shape.data.stack),
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces to use to build our tRPC API. We should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how we create new routers and sub-routers in our tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece we use to build new queries and mutations on our tRPC API. It does not
 * guarantee that a user querying is authorized, but we can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure
  /**
   * Opentelemetry tRPC middleware that names the handling transaction after the called procedure.
   */
  .use(async (opts) => {
    /**
     * Default timeout for all procedures
     */
    const result = await timeout(() => opts.next(), 12_000, opts.path)();
    return result;
  });

export const createCallerFactory = t.createCallerFactory;
