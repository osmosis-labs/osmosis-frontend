import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { useCallback, useEffect, useState } from "react";

import { api } from "~/utils/trpc";

export const useOneClickTradingParams = () => {
  const { data: defaultTransaction1CTParams, isLoading } =
    api.edge.oneClickTrading.getDefaultParameters.useQuery(undefined);
  const [transaction1CTParams, setTransaction1CTParams] = useState<
    OneClickTradingTransactionParams | undefined
  >();
  const [initialTransaction1CTParams, setInitialTransaction1CTParams] =
    useState<OneClickTradingTransactionParams | undefined>();

  useEffect(() => {
    if (!defaultTransaction1CTParams || transaction1CTParams) return;

    const nextTransaction1CTParams = {
      ...defaultTransaction1CTParams,
      isOneClickEnabled: false,
    };
    setTransaction1CTParams({
      ...defaultTransaction1CTParams,
      isOneClickEnabled: false,
    });
    setInitialTransaction1CTParams(nextTransaction1CTParams);
  }, [defaultTransaction1CTParams, transaction1CTParams]);

  const reset = useCallback(() => {
    if (!defaultTransaction1CTParams && !initialTransaction1CTParams) return;
    setTransaction1CTParams(
      defaultTransaction1CTParams
        ? {
            ...defaultTransaction1CTParams,
            isOneClickEnabled: false,
          }
        : initialTransaction1CTParams
    );
  }, [defaultTransaction1CTParams, initialTransaction1CTParams]);

  return {
    transaction1CTParams,
    setTransaction1CTParams,
    spendLimitTokenDecimals:
      defaultTransaction1CTParams?.spendLimitTokenDecimals,
    isLoading,
    reset,
  };
};
