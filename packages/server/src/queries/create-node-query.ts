import { Chain } from "@osmosis-labs/types";
import { apiClient, ClientOptions } from "@osmosis-labs/utils";
import { runIfFn } from "@osmosis-labs/utils";

/** Creates a node query function that can be used to query any
 *  chain in the given chain list.
 *
 *  If given a `chainId` it will try to query that chain's endpoint
 *  or will throw if not found. If not given a `chainId`, it will
 *  query the first chain in the list as though it were the preferred chain.
 *
 *  Can be provided additional options for sending a fetch request
 *  that isn't a simple GET request. If the options include a body,
 *  the request will be sent to the RPC endpoint since it's
 *  assumed the LCD rest endpoint only accepts GET requests.
 *
 *  ENDPOINT FALLBACK (staggered parallel):
 *  The REST endpoints come from the chain's asset list (osmosis-labs/assetlists).
 *  Each round adds one more endpoint tried in parallel, up to `maxWindowSize`:
 *    Round 1: [ep1]              — 5s window
 *    Round 2: [ep1, ep2]         — 5s window
 *    Round 3: [ep1, ep2, ep3]    — 5s window (window full)
 *    Round 4: [ep2, ep3, ep4]    — slides
 *  The first successful response in any round is returned immediately.
 *  This reduces time-to-fallback from (retries × timeout) per endpoint
 *  to one timeout window regardless of which endpoint responds.
 *
 *  - [ ]: add node query error handling (like deserializing code)
 *  and extend `ApiClientError`
 */
/** Resolves with the first promise that fulfills, or rejects if all reject.
 *  Equivalent to Promise.any() without requiring ES2021 lib. */
function raceToFirst<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    let rejectedCount = 0;
    promises.forEach((p) => {
      p.then(resolve, () => {
        rejectedCount++;
        if (rejectedCount === promises.length) reject();
      });
    });
  });
}

export const createNodeQuery =
  <Result, PathParameters extends Record<any, any> | unknown = unknown>({
    path,
    options,
    timeout = 5000,
    maxWindowSize = 3,
  }: {
    path: string | ((params: PathParameters) => string);
    /** Additional query options such as
     *  headers, body, etc. If a body is included
     *  the query will be redirected to the RPC endpoint
     *  due to the node-query invariant of rest services
     *  only accepting GET requests. */
    options?: (params: PathParameters) => ClientOptions;
    /** Request timeout in milliseconds per round. Default: 5000ms */
    timeout?: number;
    /** Maximum number of endpoints tried in parallel per round. Default: 3 */
    maxWindowSize?: number;
  }) =>
  async (
    ...params: PathParameters extends Record<any, any>
      ? [PathParameters & { chainId?: string; chainList: Chain[] }]
      : [{ chainId?: string; chainList: Chain[] }]
  ): Promise<Result> => {
    const chainList = params[0]?.chainList;

    if (!chainList) throw new Error("Missing chainList");

    const chainId =
      (params as [PathParameters & { chainId?: string }])[0]?.chainId ??
      chainList[0].chain_id;

    const chain = chainList.find((chain) => chain.chain_id === chainId);

    if (!chain) throw new Error(`Chain ${chainId} not found`);

    // Get all available REST endpoints from the chain's asset list
    const restEndpoints = chain.apis.rest;

    if (!restEndpoints || restEndpoints.length === 0) {
      throw new Error(`No REST endpoints available for chain ${chainId}`);
    }

    const opts = options?.(...(params as [PathParameters]));
    const pathStr = runIfFn(
      path,
      ...((params as [PathParameters & { chainId?: string }]) ?? [])
    );

    // Each round introduces one new endpoint. Total rounds = total endpoints.
    for (let round = 0; round < restEndpoints.length; round++) {
      const windowEnd = round + 1;
      const windowStart = Math.max(0, windowEnd - maxWindowSize);
      const window = restEndpoints.slice(windowStart, windowEnd);

      // All requests in the round share a single timeout signal so the
      // window expires atomically and zombies are aborted on success.
      let timeoutSignal: AbortSignal | undefined;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      let abortController: AbortController | undefined;

      if (typeof AbortSignal.timeout === "function") {
        timeoutSignal = AbortSignal.timeout(timeout);
      } else if (timeout > 0) {
        abortController = new AbortController();
        timeoutSignal = abortController.signal;
        timeoutId = setTimeout(() => abortController?.abort(), timeout);
      }

      try {
        const result = await raceToFirst<Result>(
          window.map((endpoint) => {
            const url = new URL(pathStr, endpoint.address);
            return apiClient<Result>(url.toString(), {
              ...opts,
              ...(timeoutSignal && { signal: timeoutSignal }),
            });
          })
        );

        // Abort any still-running requests in the window
        abortController?.abort();
        if (timeoutId) clearTimeout(timeoutId);

        return result;
      } catch {
        if (timeoutId) clearTimeout(timeoutId);

        if (round < restEndpoints.length - 1) {
          console.warn(
            `[createNodeQuery] Round ${round + 1}/${restEndpoints.length} failed for chain ${chainId}. Adding endpoint and retrying...`
          );
        } else {
          console.warn(
            `[createNodeQuery] All ${restEndpoints.length} endpoints exhausted for chain ${chainId}.`
          );
        }
      }
    }

    throw new Error(
      `All ${restEndpoints.length} REST endpoints failed for chain ${chainId}.`
    );
  };
