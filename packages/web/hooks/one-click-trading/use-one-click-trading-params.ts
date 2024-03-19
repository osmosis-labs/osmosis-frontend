import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { OneClickTradingInfo } from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { useCallback, useEffect, useState } from "react";

import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { api } from "~/utils/trpc";

export function getParametersFromOneClickTradingInfo({
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
 * Custom React hook to manage and provide parameters for one-click trading transactions.
 *
 * This hook is designed to fetch and maintain the default parameters for one-click trading,
 * allowing for easy access and modification within components. If `oneClickTradingInfo` is provided, it uses
 * this to set initial parameters. Otherwise, it fetches the default parameters from the application's API.
 *
 * The hook also provides a mechanism to reset the parameters to their initial values, which
 * can be either the custom parameters passed at initialization or the fetched default parameters.
 *
 * This hook is primarily intended for the one click trading settings modal.
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
  } = api.edge.oneClickTrading.getParameters.useQuery();

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

    const nextTransaction1CTParams = paramsToSet
      ? {
          isOneClickEnabled: defaultIsOneClickEnabled,
          ...paramsToSet,
        }
      : initialTransaction1CTParams;
    setTransaction1CTParams(nextTransaction1CTParams);
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
