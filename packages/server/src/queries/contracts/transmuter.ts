import { getQuerySmartContractPath } from "../cosmwasm/wasm";
import { createNodeQuery } from "../create-node-query";

interface TransmuterTotalPoolLiquidityResponse {
  data: {
    total_pool_liquidity: {
      denom: string;
      amount: string;
    }[];
  };
}

/**
 * returns an array with the composition of the liquidity in the pool
 */
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
