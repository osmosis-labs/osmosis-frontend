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
 *  ENDPOINT FALLBACK:
 *  The REST endpoints come from the chain's asset list (osmosis-labs/assetlists).
 *  Each chain can have multiple REST endpoints for redundancy. This function will:
 *  1. Try each endpoint in order from the chain.apis.rest array
 *  2. Retry each endpoint up to `maxRetries` times with exponential backoff
 *  3. Move to the next endpoint if all retries fail
 *  4. Throw an error only if all endpoints have been exhausted
 *
 *  - [ ]: add node query error handling (like deserializing code)
 *  and extend `ApiClientError`
 */
export const createNodeQuery =
  <Result, PathParameters extends Record<any, any> | unknown = unknown>({
    path,
    options,
    maxRetries = 3,
    timeout = 5000,
  }: {
    path: string | ((params: PathParameters) => string);
    /** Additional query options such as
     *  headers, body, etc. If a body is included
     *  the query will be redirected to the RPC endpoint
     *  due to the node-query invariant of rest services
     *  only accepting GET requests. */
    options?: (params: PathParameters) => ClientOptions;
    /** Maximum number of retries per endpoint before trying the next one.
     *  Default: 3 */
    maxRetries?: number;
    /** Request timeout in milliseconds. Default: 5000ms */
    timeout?: number;
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

    let lastError: Error | null = null;

    // Try each endpoint with retries
    for (let endpointIndex = 0; endpointIndex < restEndpoints.length; endpointIndex++) {
      const endpoint = restEndpoints[endpointIndex];
      const baseUrl = endpoint.address;

      // Retry current endpoint with exponential backoff
      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          const url = new URL(pathStr, baseUrl);

          // AbortSignal.timeout is only available in Node 17.3+ and modern browsers
          const timeoutSignal =
            typeof AbortSignal.timeout === "function"
              ? AbortSignal.timeout(timeout)
              : undefined;

          const result = await apiClient<Result>(url.toString(), {
            ...opts,
            ...(timeoutSignal && { signal: timeoutSignal }),
          });

          // Success! Return immediately
          return result;
        } catch (error) {
          lastError = error as Error;

          // Log the failure for debugging
          if (retry === maxRetries - 1) {
            // Last retry for this endpoint
            console.warn(
              `[createNodeQuery] Endpoint ${baseUrl} failed after ${maxRetries} retries. ` +
                (endpointIndex < restEndpoints.length - 1
                  ? "Trying next endpoint..."
                  : "No more endpoints available."),
              lastError.message
            );
          }

          // Wait before retry with exponential backoff (100ms, 200ms, 400ms, ...)
          // Don't wait on the last retry if there are more endpoints to try
          if (retry < maxRetries - 1) {
            const backoffDelay = Math.pow(2, retry) * 100;
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          }
        }
      }
    }

    // All endpoints exhausted
    throw new Error(
      `All ${restEndpoints.length} REST endpoints failed for chain ${chainId} after ${maxRetries} retries each. ` +
        `Last error: ${lastError?.message || "Unknown error"}`
    );
  };
