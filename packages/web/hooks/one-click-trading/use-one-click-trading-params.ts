import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { OneClickTradingInfo } from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { Dec, DecUtils, PricePretty } from "@osmosis-labs/unit";
import { OneClickTradingMaxGasLimit, runIfFn } from "@osmosis-labs/utils";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { compare1CTTransactionParams } from "~/components/one-click-trading/one-click-trading-settings";
import { api } from "~/utils/trpc";

export function getParametersFromOneClickTradingInfo({
  oneClickTradingInfo,
  defaultIsOneClickEnabled,
}: {
  oneClickTradingInfo: OneClickTradingInfo;
  defaultIsOneClickEnabled: boolean;
}): OneClickTradingTransactionParams {
  const OldHumanizedSessionPeriods = [
    "5min",
    "10min",
    "30min",
    "3hours",
    "12hours",
  ] as const;

  return {
    isOneClickEnabled: defaultIsOneClickEnabled,
    networkFeeLimit:
      typeof oneClickTradingInfo.networkFeeLimit !== "string"
        ? OneClickTradingMaxGasLimit
        : oneClickTradingInfo.networkFeeLimit,
    sessionPeriod: {
      end: OldHumanizedSessionPeriods.includes(
        oneClickTradingInfo.humanizedSessionPeriod as (typeof OldHumanizedSessionPeriods)[number]
      ) // If the session period is one of the old ones, map it to "1hour"
        ? "7days"
        : oneClickTradingInfo.humanizedSessionPeriod,
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
 * The hook provides a mechanism to reset the parameters to their initial values and tracks changes
 * to the parameters when `trackChanges` is true, comparing them against the initial values.
 *
 * This hook is primarily intended for the one click trading settings modal.
 */
export function useOneClickTradingParams({
  oneClickTradingInfo,
  defaultIsOneClickEnabled = false,
}: {
  oneClickTradingInfo?: OneClickTradingInfo;
  defaultIsOneClickEnabled?: boolean;
} = {}) {
  const { data: defaultParams, isLoading } =
    api.local.oneClickTrading.getParameters.useQuery();

  const [draftParams, setDraftParams] = useState<
    OneClickTradingTransactionParams | undefined
  >();
  const [currentParams, setCurrentParams] = useState<
    OneClickTradingTransactionParams | undefined
  >();

  const [changes, setChanges] = useState<OneClickTradingParamsChanges>([]);

  const sessionOrDefaultParams = useMemo(
    () =>
      oneClickTradingInfo
        ? getParametersFromOneClickTradingInfo({
            oneClickTradingInfo,
            defaultIsOneClickEnabled,
          })
        : defaultParams,
    [oneClickTradingInfo, defaultIsOneClickEnabled, defaultParams]
  );

  const sessionOrDefaultWithEnabled = useMemo(
    () =>
      sessionOrDefaultParams && {
        ...sessionOrDefaultParams,
        isOneClickEnabled: defaultIsOneClickEnabled,
      },
    [sessionOrDefaultParams, defaultIsOneClickEnabled]
  );

  const reset = useCallback(() => {
    setCurrentParams(sessionOrDefaultWithEnabled);
    setDraftParams(sessionOrDefaultWithEnabled);
    setChanges([]);
  }, [sessionOrDefaultWithEnabled]);

  useEffect(() => {
    if (!sessionOrDefaultWithEnabled) return;

    if (!currentParams || !draftParams) {
      reset();
      return;
    }

    const hasChanges = changes.length > 0;
    const wouldChange =
      compare1CTTransactionParams({
        prevParams: draftParams,
        nextParams: sessionOrDefaultWithEnabled,
      }).length > 0;

    if (!hasChanges && wouldChange) {
      reset();
    }
  }, [
    sessionOrDefaultParams,
    draftParams,
    sessionOrDefaultWithEnabled,
    changes.length,
    reset,
    currentParams,
  ]);

  const setTransaction1CTParamsWithChanges = useCallback(
    (
      newDraftOrFn: SetStateAction<OneClickTradingTransactionParams | undefined>
    ) => {
      if (!currentParams) reset();

      const nextDraftParams = runIfFn(newDraftOrFn, draftParams);

      setDraftParams(nextDraftParams);

      setChanges(() =>
        compare1CTTransactionParams({
          prevParams: currentParams,
          nextParams: nextDraftParams,
        })
      );
    },
    [currentParams, reset, draftParams]
  );

  return {
    changes,
    initialTransaction1CTParams: currentParams,
    transaction1CTParams: draftParams,
    spendLimitTokenDecimals: defaultParams?.spendLimitTokenDecimals,
    isLoading,
    reset,
    setChanges,
    setTransaction1CTParams: setTransaction1CTParamsWithChanges,
  };
}

export type OneClickTradingParamsChanges = Array<
  "spendLimit" | "sessionPeriod" | "isEnabled" | "networkFeeLimit"
>;
