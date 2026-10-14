import { ChainGetter } from "@osmosis-labs/keplr-stores";
import { getTimeoutHeight } from "@osmosis-labs/server";
import type { DeliverTxResponse } from "@osmosis-labs/tx";
import { makeIBCTransferMsg } from "@osmosis-labs/tx";
import { AppCurrency, Dec, DecUtils } from "@osmosis-labs/unit";

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
    const actualAmount = (() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toString();
    })();

    // Latest block height + 150 on the counterparty chain, with its revision
    // number (omitted when 0). Fetched from the registry RPCs, hedged.
    const timeoutHeight = await getTimeoutHeight({
      chainList: this.base.chains,
      chainId: channel.counterpartyChainId,
    });

    const msg = await makeIBCTransferMsg({
      sourcePort: channel.portId,
      sourceChannel: channel.channelId,
      token: {
        denom: currency.coinMinimalDenom,
        amount: actualAmount,
      },
      receiver: recipient,
      sender: this.address,
      timeoutHeight: {
        revisionNumber: timeoutHeight.revisionNumber
          ? BigInt(timeoutHeight.revisionNumber)
          : undefined,
        revisionHeight: BigInt(timeoutHeight.revisionHeight),
      },
      timeoutTimestamp: BigInt(0),
      memo: memo ? memo : "",
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "sendIbcTransfer",
      [msg],
      "",
      undefined,
      undefined,
      onTxEvents
    );
  }
}
