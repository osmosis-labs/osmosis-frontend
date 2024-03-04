import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { Dispatch, SetStateAction } from "react";

export interface OneClickTradingBaseScreenProps {
  transaction1CTParams: OneClickTradingTransactionParams;
  setTransaction1CTParams: Dispatch<
    SetStateAction<OneClickTradingTransactionParams | undefined>
  >;
}
