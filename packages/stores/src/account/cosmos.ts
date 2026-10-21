import { ChainGetter } from "@osmosis-labs/keplr-stores";
import type { DeliverTxResponse } from "@osmosis-labs/tx";
import {
  prepareIBCTransferMsg,
  type TransactionPreparationContext,
} from "@osmosis-labs/tx";
import { AppCurrency } from "@osmosis-labs/unit";

import { AccountStore, CosmwasmAccount, OsmosisAccount } from "../account";

export interface CosmosAccount {
  cosmos: CosmosAccountImpl;
}

export const CosmosAccount = {
  use(): (
    base: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>,
    chainGetter: ChainGetter,
    chainId: string
  ) => CosmosAccount {
    return (base, chainGetter, chainId) => {
      return {
        cosmos: new CosmosAccountImpl(base, chainGetter, chainId),
      };
    };
  },
};

export class CosmosAccountImpl {
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
   * Send an IBC transfer transaction.
   *
   * @param channel - The channel information for the IBC transfer.
   * @param amount - The amount to send.
   * @param currency - The currency to send.
   * @param recipient - The recipient address.
   * @param onTxEvents - Optional callback function or object to handle transaction events.
   * @param memo - Optional memo to include with the transaction.
   */
  async sendIBCTransferMsg(
    channel: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    },
    amount: string,
    currency: AppCurrency,
    recipient: string,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: DeliverTxResponse) => void;
        },
    memo?: string
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareIBCTransferMsg(
        this.preparationContext,
        channel,
        amount,
        currency,
        recipient,
        onTxEvents,
        memo
      ))
    );
  }
}
