import { Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { OneClickTradingInfo } from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { OneClickTradingMaxGasLimit } from "@osmosis-labs/utils";
import { SetStateAction, useCallback, useEffect, useState } from "react";

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
 * If `oneClickTradingInfo` needs time to stabilize before we can set reliably the initial value for
 * `transaction1CTParams`, we can set `readyToInitialize` to `true` when it's stable.
 *
 * The hook provides a mechanism to reset the parameters to their initial values and tracks changes
 * to the parameters when `trackChanges` is true, comparing them against the initial values.
 *
 * This hook is primarily intended for the one click trading settings modal.
 */
export function useOneClickTradingParams({
  oneClickTradingInfo,
  defaultIsOneClickEnabled = false,
  enabled = true,
}: {
  oneClickTradingInfo?: OneClickTradingInfo;
  defaultIsOneClickEnabled?: boolean;
  enabled?: boolean;
} = {}) {
  const {
    data: defaultTransaction1CTParams,
    isLoading,
    isError,
  } = api.local.oneClickTrading.getParameters.useQuery();

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

  const [changes, setChanges] = useState<OneClickTradingParamsChanges>([]);

  useEffect(() => {
    if (!enabled || isLoading || transaction1CTParams) return;

    const paramsToSet = oneClickTradingInfo
      ? getParametersFromOneClickTradingInfo({
          oneClickTradingInfo,
          defaultIsOneClickEnabled,
        })
      : defaultTransaction1CTParams;

    if (!paramsToSet) return;

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
    enabled,
    isLoading,
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

    setChanges([]);
  }, [
    defaultIsOneClickEnabled,
    defaultTransaction1CTParams,
    initialTransaction1CTParams,
    oneClickTradingInfo,
  ]);

  const setTransaction1CTParamsWithChanges = useCallback(
    (
      newParams: SetStateAction<OneClickTradingTransactionParams | undefined>
    ) => {
      if (!initialTransaction1CTParams) return;

      const nextParams =
        typeof newParams === "function"
          ? newParams(transaction1CTParams)
          : newParams;

      setTransaction1CTParams(nextParams);

      setChanges((prev) => {
        const current = compare1CTTransactionParams({
          prevParams: initialTransaction1CTParams,
          nextParams: nextParams!,
        });

        // Only update changes if there are new changes
        return current.some((change) => !prev.includes(change))
          ? Array.from(new Set([...prev, ...current]))
          : prev;
      });
    },
    [initialTransaction1CTParams, transaction1CTParams]
  );

  return {
    changes,
    initialTransaction1CTParams,
    transaction1CTParams,
    spendLimitTokenDecimals:
      defaultTransaction1CTParams?.spendLimitTokenDecimals,
    isLoading,
    isError,
    reset,
    setChanges,
    setTransaction1CTParams: setTransaction1CTParamsWithChanges,
  };
}

export type OneClickTradingParamsChanges = Array<
  "spendLimit" | "sessionPeriod" | "isEnabled" | "networkFeeLimit"
>;

/**
 * Compares the changes between two sets of OneClickTradingTransactionParams.
 * Useful for determining which parameters have changed and need to be updated.
 */
export function compare1CTTransactionParams({
  prevParams,
  nextParams,
}: {
  prevParams: OneClickTradingTransactionParams;
  nextParams: OneClickTradingTransactionParams;
}): OneClickTradingParamsChanges {
  let changes: OneClickTradingParamsChanges = [];

  if (prevParams?.spendLimit.toString() !== nextParams?.spendLimit.toString()) {
    changes.push("spendLimit");
  }

  if (prevParams?.sessionPeriod.end !== nextParams?.sessionPeriod.end) {
    changes.push("sessionPeriod");
  }

  if (prevParams?.isOneClickEnabled !== nextParams?.isOneClickEnabled) {
    changes.push("isEnabled");
  }

  if (prevParams?.networkFeeLimit !== nextParams?.networkFeeLimit) {
    changes.push("networkFeeLimit");
  }

  return changes;
}
