import "~/utils/superjson";

import {
  OperationResultEnvelope,
  TRPCClientError,
  TRPCLink,
} from "@trpc/client";
import { AnyRouter } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { wrap } from "comlink";

import { superjson } from "~/utils/superjson";

let worker: any = null;

export async function initializeTrpcWorker() {
  if (!worker) {
    worker = wrap(
      new Worker(new URL("./workers/trpc-worker.ts", import.meta.url))
    );
    console.log(worker);
  }
  return worker;
}

/**
 * Creates a local link for tRPC operations.
 * This function is used to create a custom TRPCLink that intercepts operations and
 * handles them locally using the provided router, instead of sending them over the network.
 */
export function workerLink<TRouter extends AnyRouter>(): TRPCLink<TRouter> {
  return () =>
    ({ op }) =>
      observable<OperationResultEnvelope<unknown>, TRPCClientError<TRouter>>(
        (observer) => {
          async function execute() {
            try {
              const worker = await initializeTrpcWorker();

              // Attempt to execute the operation using the router's caller.
              const data = superjson.parse(
                await worker.processRequest(superjson.stringify(op))
              );

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
