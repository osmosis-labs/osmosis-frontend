import type { AminoMsg, StdFee } from "@cosmjs/amino";
import {
  ChainWalletBase,
  SignOptions as CosmoskitSignOptions,
  Wallet,
} from "@cosmos-kit/core";
import {
  OneClickTradingHumanizedSessionPeriod,
  OneClickTradingTimeLimit,
} from "@osmosis-labs/types";
import type { MsgData } from "cosmjs-types/cosmos/base/abci/v1beta1/abci";
import { UnionToIntersection } from "utility-types";

import { WalletConnectionInProgressError } from "./wallet-errors";

export type TxEvent = {
  type: string;
  attributes: {
    key: string;
    value: string;
  }[];
};

export interface DeliverTxResponse {
  readonly events?: TxEvent[];
  readonly height?: number;
  /** Error code. The transaction succeeded if code is 0. */
  readonly code: number;
  readonly transactionHash: string;
  readonly rawLog?: string;
  readonly data?: readonly MsgData[];
  readonly gasUsed: string;
  readonly gasWanted: string;
}

export type CosmosRegistryWallet = Omit<Wallet, "logo"> & {
  logo: string;
  lazyInstall: () => any;
  stakeUrl?: string;
  governanceUrl?: string;
  /** Used to determine if wallet is installed. */
  windowPropertyName?: string;
  /**
   * This methods checks if a chain is available for a given wallet.
   *
   * This for wallets that do not support custom addition of chains (suggest chain).
   */
  supportsChain?: (chainId: string) => Promise<boolean>;
  /**
   * Evaluates the provided error message to ascertain the specific connection-related error
   * from a wallet.
   *
   * Use Case:
   * With multiple wallets in use, each might generate unique error messages for similar issues.
   * To maintain consistency in error handling across the application, this method helps
   * translate various wallet-specific errors into predefined standardized error types.
   *
   * @param {string} error - The error message coming from a wallet.
   *
   * @returns {ErrorType | string} - Depending on the nature of the error, the method returns
   * an appropriate error type (e.g., `WalletConnectionInProgressError`, etc.).
   * If the error is not recognized or doesn't match predefined conditions, the original error message is returned.
   */
  matchError?: (error: string) => WalletConnectionInProgressError | string;

  /**
   * An array of features supported by the wallet.
   *
   * This can be used to determine the capabilities of the wallet and enable or disable
   * functionality accordingly within the application.
   *
   * For example, if "notifications" is included in the array, the app will display
   * the notifications button.
   */
  features: Array<"notifications">;

  signOptions?: SignOptions;
};

export type AccountStoreWallet<Injects extends Record<string, any>[] = []> =
  ChainWalletBase &
    UnionToIntersection<Injects[number]> & {
      txTypeInProgress: string;
      isReadyToSendTx: boolean;
      supportsChain: Required<CosmosRegistryWallet>["supportsChain"];
      walletInfo: CosmosRegistryWallet;
    };

export interface TxEvents {
  onBroadcastFailed?: (string: string, e?: Error) => void;
  onBroadcasted?: (string: string, txHash: Uint8Array) => void;
  onFulfill?: (string: string, tx: any) => void;
  onExceeds1CTNetworkFeeLimit?: (params: {
    // Continue with a wallet like Keplr.
    continueTx: () => void;
    // User will update his params so we cancel the transaction
    finish: () => void;
  }) => void;
}

export interface OneClickTradingInfo {
  readonly authenticatorId: string;
  readonly publicKey: string;
  readonly sessionKey: string;
  readonly userOsmoAddress: string;

  /**
   * Max gas limit allowed for the transaction.
   */
  networkFeeLimit: string;

  spendLimit: {
    decimals: number;
    amount: string;
  };

  // Time limit for the session to be considered valid.
  readonly sessionPeriod: OneClickTradingTimeLimit;
  readonly humanizedSessionPeriod: OneClickTradingHumanizedSessionPeriod;
  readonly sessionStartedAtUnix: number;
  readonly allowedMessages: string[];
  readonly hasSeenExpiryToast: boolean;
}

/**
 * The document to be signed
 * Referenced from Cosmjs
 * https://github.com/cosmos/cosmjs/blob/287278004b9e6a682a1a0b1664ba54646f65a1a0/packages/amino/src/signdoc.ts#L21-L35
 *
 * We copied it over to work around dependency updates.
 */
export interface StdSignDoc {
  readonly chain_id: string;
  readonly account_number: string;
  readonly sequence: string;
  readonly fee: StdFee;
  readonly msgs: readonly AminoMsg[];
  readonly memo: string;
  readonly timeout_height?: string;
}

export interface SignOptions extends CosmoskitSignOptions {
  useOneClickTrading?: boolean;
}
