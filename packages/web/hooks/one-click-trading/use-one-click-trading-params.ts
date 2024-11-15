import { Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { OneClickTradingInfo } from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { OneClickTradingMaxGasLimit, runIfFn } from "@osmosis-labs/utils";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

  const [draft, setDraft] = useState<
    OneClickTradingTransactionParams | undefined
  >();
  const [current, setCurrent] = useState<
    OneClickTradingTransactionParams | undefined
  >();

  const [changes, setChanges] = useState<OneClickTradingParamsChanges>([]);

  const sessionOrDefault = useMemo(
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
      sessionOrDefault && {
        ...sessionOrDefault,
        isOneClickEnabled: defaultIsOneClickEnabled,
      },
    [sessionOrDefault, defaultIsOneClickEnabled]
  );

  const reset = useCallback(() => {
    setCurrent(sessionOrDefaultWithEnabled);
    setDraft(sessionOrDefaultWithEnabled);
    setChanges([]);
  }, [sessionOrDefaultWithEnabled]);

  useEffect(() => {
    if (!sessionOrDefaultWithEnabled) return;

    if (!current || !draft) {
      reset();
      return;
    }

    const hasChanges = changes.length > 0;
    const wouldChange =
      compareParams({
        prev: draft,
        next: sessionOrDefaultWithEnabled,
      }).length > 0;

    if (!hasChanges && wouldChange) {
      reset();
    }
  }, [
    sessionOrDefault,
    draft,
    sessionOrDefaultWithEnabled,
    changes.length,
    reset,
    current,
  ]);

  const setTransaction1CTParamsWithChanges = useCallback(
    (
      newDraftOrFn: SetStateAction<OneClickTradingTransactionParams | undefined>
    ) => {
      if (!current) reset();

      const nextDraft = runIfFn(newDraftOrFn, draft);

      setDraft(nextDraft);

      setChanges(() =>
        compareParams({
          prev: current,
          next: nextDraft,
        })
      );
    },
    [current, reset, draft]
  );

  return {
    changes,
    initialTransaction1CTParams: current,
    transaction1CTParams: draft,
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

function compareParams({
  prev,
  next,
}: {
  prev?: OneClickTradingTransactionParams;
  next?: OneClickTradingTransactionParams;
}): OneClickTradingParamsChanges {
  let changes: OneClickTradingParamsChanges = [];

  if (prev?.spendLimit.toString() !== next?.spendLimit.toString()) {
    changes.push("spendLimit");
  }

  if (prev?.sessionPeriod.end !== next?.sessionPeriod.end) {
    changes.push("sessionPeriod");
  }

  if (prev?.isOneClickEnabled !== next?.isOneClickEnabled) {
    changes.push("isEnabled");
  }

  if (prev?.networkFeeLimit !== next?.networkFeeLimit) {
    changes.push("networkFeeLimit");
  }

  return changes;
}
