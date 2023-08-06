import { ChainIdHelper } from "@keplr-wallet/cosmos";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
  txEventsWithPreOnFulfill,
} from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { Dec, DecUtils, Int } from "@keplr-wallet/unit";
import deepmerge from "deepmerge";
import Long from "long";
import { DeepPartial } from "utility-types";

import {
  AccountStore,
  CosmwasmAccount,
  DeliverTxResponse,
  OsmosisAccount,
} from "../../account";
import { OsmosisQueries } from "../../queries";
import { cosmosMsgOpts } from "./types";

export interface CosmosAccount {
  cosmos: CosmosAccountImpl;
}

export const CosmosAccount = {
  use(options: {
    msgOptsCreator?: (
      chainId: string
    ) => DeepPartial<typeof cosmosMsgOpts> | undefined;
    queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>;
  }): (
    base: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>,
    chainGetter: ChainGetter,
    chainId: string
  ) => CosmosAccount {
    return (base, chainGetter, chainId) => {
      const msgOptsFromCreator = options.msgOptsCreator
        ? options.msgOptsCreator(chainId)
        : undefined;

      return {
        cosmos: new CosmosAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore,
          deepmerge<typeof cosmosMsgOpts, DeepPartial<typeof cosmosMsgOpts>>(
            cosmosMsgOpts,
            msgOptsFromCreator ? msgOptsFromCreator : {}
          )
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
    >,
    readonly msgOpts: typeof cosmosMsgOpts
  ) {}

  private get address() {
    return this.base.getWallet(this.chainId)?.address ?? "";
  }

  /**
   * Send a IBC transfer transaction.
   *
   * @param channel the channel to send the IBC transfer transaction.
   * @param amount the amount to send.
   * @param currency the currency to send.
   * @param recipient the recipient address.
   * @param onTxEvents the callback function to handle the transaction events.
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
        }
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

    const msg = this.msgOpts.ibcTransfer.messageComposer({
      sourcePort: channel.portId,
      sourceChannel: channel.channelId,
      token: {
        denom: currency.coinMinimalDenom,
        amount: actualAmount,
      },
      receiver: recipient,
      sender: this.address,
      timeoutHeight: {
        /**
         * Omit the revision_number if the chain's version is 0.
         * Sending the value as 0 will cause the transaction to fail.
         */
        revisionNumber:
          revisionNumber !== "0"
            ? Long.fromString(revisionNumber)
            : (undefined as any),
        revisionHeight: BigInt(
          destinationInfo.latestBlockHeight.add(new Int("150")).toString()
        ),
      },
      timeoutTimestamp: BigInt(0),
      memo: "",
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "sendIbcTransfer",
      [msg],
      "",
      {
        amount: [],
        gas: this.msgOpts.ibcTransfer.gas.toString(),
      },
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

export * from "./types";
