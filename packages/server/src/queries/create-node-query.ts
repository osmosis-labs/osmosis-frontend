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
 *  - [ ]: add node query error handling (like deserializing code)
 *  and extend `ApiClientError`
 */
export const createNodeQuery =
  <Result, PathParameters extends Record<any, any> | unknown = unknown>({
    path,
    options,
  }: {
    path: string | ((params: PathParameters) => string);
    /** Additional query options such as
     *  headers, body, etc. If a body is included
     *  the query will be redirected to the RPC endpoint
     *  due to the node-query invariant of rest services
     *  only accepting GET requests. */
    options?: (params: PathParameters) => ClientOptions;
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

    const opts = options?.(...(params as [PathParameters]));

    const url = new URL(
      runIfFn(
        path,
        ...((params as [PathParameters & { chainId?: string }]) ?? [])
      ),
      chain.apis.rest[0].address
    );
    if (opts) return apiClient<Result>(url.toString(), opts);
    else return apiClient<Result>(url.toString());
  };
