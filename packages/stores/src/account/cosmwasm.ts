import type { StdFee } from "@cosmjs/amino";
import { ChainGetter, CoinPrimitive } from "@osmosis-labs/keplr-stores";
import type { DeliverTxResponse } from "@osmosis-labs/tx";
import {
  prepareExecuteContractMsg,
  prepareMultiExecuteContractMsg,
  type TransactionPreparationContext,
} from "@osmosis-labs/tx";
import { Optional } from "utility-types";

import { AccountStore, CosmosAccount, OsmosisAccount } from "../account";

export interface CosmwasmAccount {
  cosmwasm: CosmwasmAccountImpl;
}

export const CosmwasmAccount = {
  use(): (
    base: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>,
    chainGetter: ChainGetter,
    chainId: string
  ) => CosmwasmAccount {
    return (base, chainGetter, chainId) => {
      return {
        cosmwasm: new CosmwasmAccountImpl(base, chainGetter, chainId),
      };
    };
  },
};

export class CosmwasmAccountImpl {
  constructor(
    protected readonly base: AccountStore<
      [OsmosisAccount, CosmosAccount, CosmwasmAccount]
    >,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string
  ) {}

  private get preparationContext(): TransactionPreparationContext {
    const getAddress = () => this.address;
    return {
      get address() {
        return getAddress();
      },
      chainId: this.chainId,
      chains: this.base.chains,
      findCurrency: (denom) =>
        this.chainGetter.getChain(this.chainId).findCurrency(denom),
      stakeCurrency: () =>
        this.chainGetter.getChain(this.chainId).stakeCurrency,
      simulatePositionMigration: (input) =>
        this.base.simulatePositionMigration(input),
    };
  }

  private get address() {
    return this.base.getWallet(this.chainId)?.address ?? "";
  }

  /**
   * Execute a cosmwasm contract.
   * @param type The type of the message.
   * @param contractAddress The address of the contract.
   * @param obj The object to be sent to the contract.
   * @param funds The funds to be sent to the contract.
   * @param TxFee The fee to be paid for the transaction.
   * @param onTxEvents The callback function to be called when the transaction is broadcasted or fulfilled.
   */
  async sendExecuteContractMsg(
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareExecuteContractMsg(
        this.preparationContext,
        type,
        contractAddress,
        obj,
        funds,
        backupFee,
        onTxEvents
      ))
    );
  }

  async sendMultiExecuteContractMsg(
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareMultiExecuteContractMsg(
        this.preparationContext,
        type,
        msgs,
        backupFee,
        onTxEvents
      ))
    );
  }
}
