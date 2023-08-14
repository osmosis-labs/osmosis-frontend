import { Wallet } from "@cosmos-kit/core";
import { MsgData } from "cosmjs-types/cosmos/base/abci/v1beta1/abci";

export type TxEvent = {
  type: string;
  attributes: {
    key: string;
    value: string;
  }[];
};

export interface DeliverTxResponse {
  readonly height?: number;
  /** Error code. The transaction suceeded if code is 0. */
  readonly code: number;
  readonly transactionHash: string;
  readonly rawLog?: string;
  readonly data?: readonly MsgData[];
  readonly gasUsed: string;
  readonly gasWanted: string;
}

export type RegistryWallet = Wallet & {
  lazyInstall: () => any;
  /** Used to determine if wallet is installed. */
  windowPropertyName?: string;
  /**
   * This methods checks if a chain is available for a given wallet.
   *
   * This for wallets that do not support custom addition of chains (suggest chain).
   */
  supportsChain?: (chainId: string) => Promise<boolean>;
};
