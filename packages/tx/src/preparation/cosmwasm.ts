import type { StdFee } from "@cosmjs/amino";
import { Optional } from "utility-types";

import type { DeliverTxResponse } from "../account/types";
import { makeExecuteCosmwasmContractMsg } from "../message-composers";

type CoinPrimitive = { denom: string; amount: string };

import {
  prepareTransaction,
  type TransactionPreparationContext,
} from "./types";

export async function prepareExecuteContractMsg(
  context: TransactionPreparationContext,
  type = "executeWasm",
  contractAddress: string,
  obj: object,
  funds: CoinPrimitive[],
  backupFee?: Optional<StdFee, "amount">,
  onTxEvents?:
    | ((tx: DeliverTxResponse) => void)
    | {
        onBroadcasted?: (txHash: Uint8Array) => void;
        onFulfill?: (tx: DeliverTxResponse) => void;
      }
) {
  const msg = await makeExecuteCosmwasmContractMsg({
    sender: context.address,
    contract: contractAddress,
    msg: obj,
    funds,
  });

  return prepareTransaction(
    type,
    [msg],
    "",
    backupFee
      ? {
          amount: backupFee?.amount ?? [],
          gas: backupFee.gas,
        }
      : undefined,
    undefined,
    onTxEvents
  );
}

export async function prepareMultiExecuteContractMsg(
  context: TransactionPreparationContext,
  type = "executeWasm",
  msgs: {
    contractAddress: string;
    msg: object;
    funds: CoinPrimitive[];
  }[],
  backupFee?: Optional<StdFee, "amount">,
  onTxEvents?:
    | ((tx: DeliverTxResponse) => void)
    | {
        onBroadcasted?: (txHash: Uint8Array) => void;
        onFulfill?: (tx: DeliverTxResponse) => void;
      }
) {
  const mappedMsgs = await Promise.all(
    msgs.map(async ({ msg, funds, contractAddress }) => {
      return await makeExecuteCosmwasmContractMsg({
        sender: context.address,
        contract: contractAddress,
        msg,
        funds,
      });
    })
  );

  return prepareTransaction(
    type,
    mappedMsgs,
    "",
    backupFee
      ? {
          amount: backupFee?.amount ?? [],
          gas: backupFee.gas,
        }
      : undefined,
    undefined,
    onTxEvents
  );
}
