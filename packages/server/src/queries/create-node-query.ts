import { Chain } from "@osmosis-labs/types";
import {
  apiClient,
  ClientOptions,
  hedgedRequest,
  HedgeOptions,
  runIfFn,
} from "@osmosis-labs/utils";

/** Creates a node query function that can be used to query any
 *  chain in the given chain list.
 *
 *  If given a `chainId` it will try to query that chain's endpoint
 *  or will throw if not found. If not given a `chainId`, it will
 *  query the first chain in the list as though it were the preferred chain.
 *
 *  The chain's REST endpoints are raced with `hedgedRequest`, in registry order.
 */
export const createNodeQuery =
  <Result, PathParameters extends Record<any, any> | unknown = unknown>({
    path,
    options,
    ...hedgeOptions
  }: {
    path: string | ((params: PathParameters) => string);
    /** Additional query options such as headers, body, etc. */
    options?: (params: PathParameters) => ClientOptions;
  } & HedgeOptions) =>
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

    const restEndpoints = chain.apis.rest;

    if (!restEndpoints || restEndpoints.length === 0) {
      throw new Error(`No REST endpoints available for chain ${chainId}`);
    }

    const opts = options?.(...(params as [PathParameters]));
    const pathStr = runIfFn(
      path,
      ...((params as [PathParameters & { chainId?: string }]) ?? [])
    );

    const { data } = await hedgedRequest<Result>(
      restEndpoints.map(({ address }) => new URL(pathStr, address).toString()),
      (url, signal) => apiClient<Result>(url, { ...opts, signal }),
      { ...hedgeOptions, name: "REST endpoints", target: `chain ${chainId}` }
    );
    return data;
  };
