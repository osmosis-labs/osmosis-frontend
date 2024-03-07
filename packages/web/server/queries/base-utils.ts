import { Chain } from "@osmosis-labs/types";
import { apiClient, getChainRestUrl } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";
import { runIfFn } from "~/utils/function";

export const createNodeQuery =
  <Result, PathParameters extends Record<any, any> | unknown = unknown>({
    path,
    chainList = ChainList,
  }: {
    path: string | ((params: PathParameters) => string);
    chainList?: Chain[];
  }) =>
  async (
    ...params: PathParameters extends Record<any, any>
      ? [PathParameters & { chainId?: string }]
      : [{ chainId?: string }?]
  ): Promise<Result> => {
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
