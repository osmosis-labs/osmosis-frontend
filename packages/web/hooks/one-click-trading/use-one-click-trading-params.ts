import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { OneClickTradingInfo } from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { useCallback, useEffect, useState } from "react";

import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { api } from "~/utils/trpc";

function getParametersFromOneClickTradingInfo({
  oneClickTradingInfo,
  defaultIsOneClickEnabled,
}: {
  oneClickTradingInfo: OneClickTradingInfo;
  defaultIsOneClickEnabled: boolean;
}): OneClickTradingTransactionParams {
  return {
    isOneClickEnabled: defaultIsOneClickEnabled,
    networkFeeLimit: new CoinPretty(
      oneClickTradingInfo.networkFeeLimit,
      new Dec(oneClickTradingInfo.networkFeeLimit.amount)
    ),
    resetPeriod: oneClickTradingInfo.resetPeriod,
    sessionPeriod: {
      end: oneClickTradingInfo.humanizedSessionPeriod,
    },
    spendLimit: new PricePretty(
      DEFAULT_VS_CURRENCY,
      new Dec(oneClickTradingInfo.spendLimit.amount).quo(
        DecUtils.getTenExponentN(oneClickTradingInfo.spendLimit.decimals)
      )
    ),
  };
}

/**
 * Hook to get the one click trading default parameters.
 * It also provides methods to reset or modify the parameters.
 * This is used in the one click trading settings modal.
 *
 * This hook reconstructs the transaction1CTParams from the oneClickTradingInfo if it's provided.
 */
export const useOneClickTradingParams = ({
  oneClickTradingInfo,
  defaultIsOneClickEnabled = false,
}: {
  oneClickTradingInfo?: OneClickTradingInfo;
  defaultIsOneClickEnabled?: boolean;
} = {}) => {
  const {
    data: defaultTransaction1CTParams,
    isLoading,
    isError,
  } = api.edge.oneClickTrading.getParameters.useQuery(undefined, {
    enabled: !oneClickTradingInfo,
  });

  const [transaction1CTParams, setTransaction1CTParams] = useState<
    OneClickTradingTransactionParams | undefined
  >(
    oneClickTradingInfo
      ? getParametersFromOneClickTradingInfo({
          oneClickTradingInfo,
          defaultIsOneClickEnabled,
        })
      : undefined
  );
  const [initialTransaction1CTParams, setInitialTransaction1CTParams] =
    useState<OneClickTradingTransactionParams | undefined>();

  useEffect(() => {
    const paramsToSet = oneClickTradingInfo
      ? getParametersFromOneClickTradingInfo({
          oneClickTradingInfo,
          defaultIsOneClickEnabled,
        })
      : defaultTransaction1CTParams;

    if (!paramsToSet || transaction1CTParams) return;

    const nextTransaction1CTParams = {
      isOneClickEnabled: defaultIsOneClickEnabled,
      ...paramsToSet,
    };
    setTransaction1CTParams(nextTransaction1CTParams);
    setInitialTransaction1CTParams(nextTransaction1CTParams);
  }, [
    defaultIsOneClickEnabled,
    defaultTransaction1CTParams,
    oneClickTradingInfo,
    transaction1CTParams,
  ]);

  const reset = useCallback(() => {
    const paramsToSet = oneClickTradingInfo
      ? getParametersFromOneClickTradingInfo({
          oneClickTradingInfo,
          defaultIsOneClickEnabled,
        })
      : defaultTransaction1CTParams;
    if (!paramsToSet && !initialTransaction1CTParams) return;

    setTransaction1CTParams(
      paramsToSet
        ? {
            isOneClickEnabled: defaultIsOneClickEnabled,
            ...paramsToSet,
          }
        : initialTransaction1CTParams
    );
  }, [
    defaultIsOneClickEnabled,
    defaultTransaction1CTParams,
    initialTransaction1CTParams,
    oneClickTradingInfo,
  ]);

  return {
    transaction1CTParams,
    setTransaction1CTParams,
    spendLimitTokenDecimals:
      defaultTransaction1CTParams?.spendLimitTokenDecimals,
    isLoading,
    isError,
    reset,
  };
};
