import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { AppCurrency } from "@keplr-wallet/types";
import { Dec, DecUtils, Int } from "@keplr-wallet/unit";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
  txEventsWithPreOnFulfill,
} from "@osmosis-labs/keplr-stores";
import { makeIBCTransferMsg } from "@osmosis-labs/tx";

import {
  AccountStore,
  CosmwasmAccount,
  DeliverTxResponse,
  OsmosisAccount,
} from "../account";
import { OsmosisQueries } from "../queries";

export interface CosmosAccount {
  cosmos: CosmosAccountImpl;
}

export const CosmosAccount = {
  use(options: {
    queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>;
  }): (
    base: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>,
    chainGetter: ChainGetter,
    chainId: string
  ) => CosmosAccount {
    return (base, chainGetter, chainId) => {
      return {
        cosmos: new CosmosAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore
        ),
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
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >
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

    const destinationInfo = this.queriesStore.get(channel.counterpartyChainId)
      .cosmos.queryRPCStatus;

    await destinationInfo.waitFreshResponse();

    if (!destinationInfo.network) {
      throw new Error(
        `Failed to fetch the network chain id of ${channel.counterpartyChainId}`
      );
    }

    if (
      !destinationInfo.latestBlockHeight ||
      destinationInfo.latestBlockHeight.equals(new Int("0"))
    ) {
      throw new Error(
        `Failed to fetch the latest block of ${channel.counterpartyChainId}`
      );
    }

    const revisionNumber = ChainIdHelper.parse(
      destinationInfo.network
    ).version.toString();

    const msg = makeIBCTransferMsg({
      sourcePort: channel.portId,
      sourceChannel: channel.channelId,
      token: {
        denom: currency.coinMinimalDenom,
        amount: actualAmount,
      },
      receiver: recipient,
      sender: this.address,
      timeoutHeight: {
        revisionNumber:
          revisionNumber !== "0" ? BigInt(revisionNumber) : undefined,
        revisionHeight: BigInt(
          destinationInfo.latestBlockHeight.add(new Int("150")).toString()
        ),
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
      txEventsWithPreOnFulfill(onTxEvents, (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);

          // After succeeding to send token, refresh the balance.
          const queryBalance = queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.find((bal) => {
              return (
                bal.currency.coinMinimalDenom === currency.coinMinimalDenom
              );
            });

          if (queryBalance) {
            queryBalance.fetch();
          }
        }
      })
    );
  }
}
