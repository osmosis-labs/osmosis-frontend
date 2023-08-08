import {
  ChainGetter,
  CoinPrimitive,
  CosmosQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import deepmerge from "deepmerge";
import { DeepPartial, Optional } from "utility-types";

import {
  AccountStore,
  CosmosAccount,
  DeliverTxResponse,
  OsmosisAccount,
  TxFee,
} from "../../account";
import { OsmosisQueries } from "../../queries";
import { cosmwasmMsgOpts } from "./types";

export interface CosmwasmAccount {
  cosmwasm: CosmwasmAccountImpl;
}

export const CosmwasmAccount = {
  use(options: {
    msgOptsCreator?: (
      chainId: string
    ) => DeepPartial<typeof cosmwasmMsgOpts> | undefined;
    queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>;
  }): (
    base: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>,
    chainGetter: ChainGetter,
    chainId: string
  ) => CosmwasmAccount {
    return (base, chainGetter, chainId) => {
      const msgOptsFromCreator = options.msgOptsCreator
        ? options.msgOptsCreator(chainId)
        : undefined;

      return {
        cosmwasm: new CosmwasmAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore,
          deepmerge<
            typeof cosmwasmMsgOpts,
            DeepPartial<typeof cosmwasmMsgOpts>
          >(cosmwasmMsgOpts, msgOptsFromCreator ? msgOptsFromCreator : {})
        ),
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
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    readonly msgOpts: typeof cosmwasmMsgOpts
  ) {}

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
    type: keyof typeof this.msgOpts | "unknown" = "executeWasm",
    contractAddress: string,
    obj: object,
    funds: CoinPrimitive[],
    backupFee?: Optional<TxFee, "amount">,
    onTxEvents?:
      | ((tx: DeliverTxResponse) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: DeliverTxResponse) => void;
        }
  ) {
    const msg = this.msgOpts.executeWasm.messageComposer({
      sender: this.address,
      contract: contractAddress,
      msg: Buffer.from(JSON.stringify(obj)),
      funds,
    });

    await this.base.signAndBroadcast(
      this.chainId,
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
}

export * from "./types";
