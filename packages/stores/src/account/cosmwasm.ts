import { StdFee } from "@cosmjs/amino";
import {
  ChainGetter,
  CoinPrimitive,
  CosmosQueries,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import { makeExecuteCosmwasmContractMsg } from "@osmosis-labs/tx";
import { Optional } from "utility-types";

import {
  AccountStore,
  CosmosAccount,
  DeliverTxResponse,
  OsmosisAccount,
} from "../account";
import { OsmosisQueries } from "../queries";

export interface CosmwasmAccount {
  cosmwasm: CosmwasmAccountImpl;
}

export const CosmwasmAccount = {
  use(options: {
    queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>;
  }): (
    base: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>,
    chainGetter: ChainGetter,
    chainId: string
  ) => CosmwasmAccount {
    return (base, chainGetter, chainId) => {
      return {
        cosmwasm: new CosmwasmAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore
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
    >
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
    const msg = makeExecuteCosmwasmContractMsg({
      sender: this.address,
      contract: contractAddress,
      msg: obj,
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
    const mappedMsgs = msgs.map(({ msg, funds, contractAddress }) => {
      return makeExecuteCosmwasmContractMsg({
        sender: this.address,
        contract: contractAddress,
        msg,
        funds,
      });
    });

    await this.base.signAndBroadcast(
      this.chainId,
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
}
