import { IFeeConfig } from "@keplr-wallet/hooks";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { Pool } from "@osmosis-labs/pools";
import { TradeTokenInConfig } from "@osmosis-labs/stores";
import { useMemo } from "react";

// CONTRACT: Use with `observer`
// If the reference of the pools changes,
// it will be recalculated without memorization for every render.
// Be sure to pass the pools argument by memorizing it.
export const useTradeTokenInConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  chainId: string,
  sender: string,
  feeConfig: IFeeConfig | undefined,
  pools: Pool[] | undefined
) =>
  useMemo(() => {
    const config = pools
      ? new TradeTokenInConfig(
          chainGetter,
          queriesStore,
          chainId,
          sender,
          feeConfig,
          pools
        )
      : undefined;

    if (config && pools) {
      config.setChain(chainId);
      config.setSender(sender);
      config.setPools(pools);
    }

    return config;
  }, [chainGetter, queriesStore, chainId, sender, feeConfig, pools]);
