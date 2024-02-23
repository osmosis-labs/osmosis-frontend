import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { useEffect, useState } from "react";

import { api } from "~/utils/trpc";

export const useOneClickTradingParams = () => {
  const { data: defaultTransaction1CTParams, isLoading } =
    api.edge.oneClickTrading.getDefaultParameters.useQuery(undefined);
  const [transaction1CTParams, setTransaction1CTParams] = useState<
    OneClickTradingTransactionParams | undefined
  >();

  useEffect(() => {
    if (defaultTransaction1CTParams && !transaction1CTParams) {
      setTransaction1CTParams({
        ...defaultTransaction1CTParams,
        isOneClickEnabled: false,
      });
    }
  }, [defaultTransaction1CTParams, transaction1CTParams]);

  return {
    transaction1CTParams,
    setTransaction1CTParams,
    spendLimitTokenDecimals:
      defaultTransaction1CTParams?.spendLimitTokenDecimals,
    isLoading,
  };
};
