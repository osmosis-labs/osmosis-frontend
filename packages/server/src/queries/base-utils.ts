import { Chain } from "@osmosis-labs/types";
import { apiClient, getChainRestUrl } from "@osmosis-labs/utils";
import { runIfFn } from "@osmosis-labs/utils";

export const createNodeQuery =
  <Result, PathParameters extends Record<any, any> | unknown = unknown>({
    path,
  }: {
    path: string | ((params: PathParameters) => string);
  }) =>
  async (
    ...params: PathParameters extends Record<any, any>
      ? [PathParameters & { chainId?: string; chainList: Chain[] }]
      : [{ chainId?: string; chainList: Chain[] }]
  ): Promise<Result> => {
    const chainList = params[0]?.chainList;

    if (!chainList) throw new Error("Missing chainList");

    const url = new URL(
      runIfFn(
        path,
        ...((params as [PathParameters & { chainId?: string }]) ?? [])
      ),
      getChainRestUrl({
        chainId:
          (params as [PathParameters & { chainId?: string }])[0]?.chainId ??
          chainList[0].chain_id,
        chainList,
      })
    );
    return apiClient<Result>(url.toString());
  };
