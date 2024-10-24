import { Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { OneClickTradingInfo } from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { OneClickTradingMaxGasLimit } from "@osmosis-labs/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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
    networkFeeLimit:
      typeof oneClickTradingInfo.networkFeeLimit !== "string"
        ? OneClickTradingMaxGasLimit
        : oneClickTradingInfo.networkFeeLimit,
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
  scopeKey = "oneClickTradingParams",
}: {
  oneClickTradingInfo?: OneClickTradingInfo;
  defaultIsOneClickEnabled?: boolean;
  scopeKey?: string;
} = {}) => {
  const [transaction1CTParams, setTransaction1CTParams] =
    useState<OneClickTradingTransactionParams>();
  const apiUtils = api.useUtils();

  const {
    data: defaultTransaction1CTParams,
    isLoading,
    isError,
    refetch: reset,
  } = useQuery({
    queryKey: [scopeKey, oneClickTradingInfo?.sessionKey],
    queryFn: async () => {
      const data = await apiUtils.local.oneClickTrading.getParameters.fetch();
      if (oneClickTradingInfo) {
        return {
          ...getParametersFromOneClickTradingInfo({
            oneClickTradingInfo,
            defaultIsOneClickEnabled,
          }),
          spendLimitTokenDecimals: data.spendLimitTokenDecimals,
        };
      }

      return {
        ...data,
        spendLimitTokenDecimals: data.spendLimitTokenDecimals,
        isOneClickEnabled: defaultIsOneClickEnabled,
      };
    },
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false, // Prevents refetching after losing the focus when accepting the transaction
    onSuccess: ({ spendLimitTokenDecimals, ...rest }) => {
      setTransaction1CTParams(rest);
    },
  });

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
