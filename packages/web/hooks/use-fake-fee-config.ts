import { useMemo } from "react";
import { ChainGetter } from "@keplr-wallet/stores";
import { FakeFeeConfig } from "@osmosis-labs/stores";

export const useFakeFeeConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  gas: number
) =>
  useMemo(() => {
    const config = new FakeFeeConfig(chainGetter, chainId, gas);
    config.setChain(chainId);
    config.setGas(gas);
    return config;
  }, [chainGetter, chainId, gas]);
