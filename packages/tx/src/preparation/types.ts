import type { Chain } from "@osmosis-labs/types";
import type { Currency } from "@osmosis-labs/unit";

import type { WalletTxClient } from "../account/client";

export type ChainBoundTxArguments =
  Parameters<WalletTxClient["signAndBroadcast"]> extends [string, ...infer Args]
    ? Args
    : never;

/** An explicit transaction description. Message thunks run inside the signing
 * operation so preflight failures still clear transaction progress. */
export function prepareTransaction(
  ...args: ChainBoundTxArguments
): ChainBoundTxArguments {
  return args;
}

export type TransactionPreparationContext = {
  address: string;
  chainId: string;
  chains: Chain[];
  findCurrency: (denom: string) => Currency | undefined;
  stakeCurrency: () => Currency;
  simulatePositionMigration: WalletTxClient["simulatePositionMigration"];
};
