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

interface TransmuterIsActiveResponse {
  data: {
    is_active: boolean;
  };
}

/** Whether the transmuter accepts swaps. A frozen one rejects them, though its
 *  calc queries still answer. */
export const queryTransmuterIsActive = createNodeQuery<
  TransmuterIsActiveResponse,
  {
    contractAddress: string;
  }
>({
  path: ({ contractAddress }) =>
    getQuerySmartContractPath({
      msg: { is_active: {} },
      contractAddress,
    }),
});

interface TransmuterAssetConfigsResponse {
  data: {
    asset_configs: {
      denom: string;
      normalization_factor: string;
    }[];
  };
}

/** The pool's member denoms (including its own alloyed denom). */
export const queryTransmuterAssetConfigs = createNodeQuery<
  TransmuterAssetConfigsResponse,
  {
    contractAddress: string;
  }
>({
  path: ({ contractAddress }) =>
    getQuerySmartContractPath({
      msg: { list_asset_configs: {} },
      contractAddress,
    }),
});
