import { getQuerySmartContractPath } from "../cosmwasm/wasm";
import { createNodeQuery } from "../create-node-query";

interface TransmuterTotalPoolLiquidityResponse {
  total_pool_liquidity: {
    denom: string;
    amount: string;
  }[];
}

export const queryTransmuterTotalPoolLiquidity = createNodeQuery<
  TransmuterTotalPoolLiquidityResponse,
  {
    contractAddress: string;
  }
>({
  path: ({ contractAddress }) => {
    const msg = {
      get_total_pool_liquidity: {},
    };

    return getQuerySmartContractPath({
      msg,
      contractAddress,
    });
  },
});
