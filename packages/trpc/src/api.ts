import { SpanStatusCode, trace } from "@opentelemetry/api";
import { superjson } from "@osmosis-labs/server";
import { AssetList, Chain } from "@osmosis-labs/types";
import { timeout } from "@osmosis-labs/utils";
import {
  httpBatchLink,
  httpLink,
  OperationResultEnvelope,
  splitLink,
  TRPCClientError,
  TRPCLink,
} from "@trpc/client";
import { type AnyRouter, initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { ZodError } from "zod";

/**
 * Pass asset lists and chain list to be used cas context in backend service.
 */
type CreateContextOptions = {
  assetLists: AssetList[];
  chainList: Chain[];
  opentelemetryServiceName: string | undefined;
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
    return {
      ...shape,
      data: {
        ...shape.data,
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
  .use(async ({ path, rawInput, type, next, ctx }) => {
    const serviceName =
      ctx.opentelemetryServiceName ?? "fallback-osmosis-frontend-service-name";
    const tracer = trace.getTracer(serviceName);

    return tracer.startActiveSpan(`trpc/${path}`, async (span) => {
      try {
        span.setAttribute("procedure_type", type);
        span.setAttribute("input", JSON.stringify(rawInput));

        const result = await next();

        if (
          typeof result === "object" &&
          result !== null &&
          "ok" in result &&
          !result.ok
        ) {
          span.setStatus({ code: SpanStatusCode.ERROR });
          if ("error" in result && result.error instanceof Error) {
            span.recordException(result.error);
          }
        } else {
          span.setStatus({ code: SpanStatusCode.OK });
        }

        return result;
      } catch (e) {
        if (e instanceof Error) {
          span.recordException(e);
          span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
        }
        throw e;
      } finally {
        span.end();
      }
    });
  })
  .use(async (opts) => {
    /**
     * Default timeout for all procedures
     */
    const result = await timeout(() => opts.next(), 12_000, opts.path)();
    return result;
  });

export const createCallerFactory = t.createCallerFactory;

/**
 * Creates a local link for tRPC operations.
 * This function is used to create a custom TRPCLink that intercepts operations and
 * handles them locally using the provided router, instead of sending them over the network.
 */
export function localLink<TRouter extends AnyRouter>({
  router,
  assetLists,
  chainList,
  opentelemetryServiceName,
}: {
  router: TRouter;
  assetLists: AssetList[];
  chainList: Chain[];
  opentelemetryServiceName: string | undefined;
}): TRPCLink<TRouter> {
  return () =>
    ({ op }) =>
      observable<OperationResultEnvelope<unknown>, TRPCClientError<TRouter>>(
        (observer) => {
          async function execute() {
            const createCaller = t.createCallerFactory(router);
            const caller = createCaller({
              assetLists,
              chainList,
              opentelemetryServiceName,
            });
            try {
              // Attempt to execute the operation using the router's caller.
              const data = await (
                caller[op.path] as (input: unknown) => unknown
              )(op.input);
              // If successful, notify the observer with the result.
              observer.next({ result: { data, type: "data" } });
              observer.complete();
            } catch (err) {
              // If an error occurs, convert it to a TRPCClientError and notify the observer.
              observer.error(TRPCClientError.from(err as Error));
            }
          }

          // Execute the operation asynchronously.
          void execute();
        }
      );
}

/**
 * Provides ability to skip batching for a specific query.
 * This is useful for preventing expensive queries from blocking less expensive queries.
 */
export const makeSkipBatchLink = (url: string) =>
  splitLink({
    condition(op) {
      // check for context property `skipBatch`
      return op.context.skipBatch === true;
    },
    // when condition is true, use normal request
    true: httpLink({
      url,
    }),
    // when condition is false, use batching
    false: httpBatchLink({
      url,
      maxURLLength: 10_000,
    }),
  });
