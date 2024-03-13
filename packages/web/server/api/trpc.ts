/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 */
import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { ZodError } from "zod";

import { Errors } from "~/server/api/errors";
import timeout from "~/utils/async";
import { superjson } from "~/utils/superjson";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow access to resources when processing a request, like the database, the session, etc.
 */
type CreateContextOptions = Record<string, never>;

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
const createInnerTRPCContext = (_opts: CreateContextOptions) => {
  return {};
};

/**
 * This is the actual context we'll use in our router. It will be used to process every request
 * that goes through our tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = (_opts: CreateNextContextOptions) => {
  return createInnerTRPCContext({});
};
export const createEdgeTRPCContext = (_opts: FetchCreateContextFnOptions) => {
  return createInnerTRPCContext({});
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors to get typesafety on the frontend if our procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  allowOutsideOfServer: true,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
        errors: error.cause instanceof Errors ? error.cause.errors : null,
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
export const publicProcedure = t.procedure.use(async (opts) => {
  /**
   * Default timeout for all procedures
   */
  const result = await timeout(() => opts.next(), 12_000, opts.path)();
  return result;
});
