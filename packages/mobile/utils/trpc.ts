import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AnyProcedure, AnyRouter } from "@trpc/server";

import { AppRouter } from "~/utils/trpc-routers/root-router";

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

type inferRouterKeys<TRouter extends AnyRouter, Prefix extends string = ""> = {
  [TKey in keyof TRouter["_def"]["record"]]: TRouter["_def"]["record"][TKey] extends infer TRouterOrProcedure
    ? TRouterOrProcedure extends AnyRouter
      ? inferRouterKeys<
          TRouterOrProcedure,
          `${Prefix}${TKey extends string ? TKey : never}.`
        >
      : TRouterOrProcedure extends AnyProcedure
      ? `${Prefix}${TKey extends string ? TKey : never}`
      : never
    : never;
}[keyof TRouter["_def"]["record"]];

/**
 * Inference helper for router keys.
 *
 * @example type HelloKey: RouterKeys = "local.quoteRouter.routeTokenOutGivenIn"
 */
export type RouterKeys = inferRouterKeys<AppRouter>;
