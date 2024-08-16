/* eslint-disable import/no-extraneous-dependencies */
import { WalletStatus } from "@cosmos-kit/core";
import { MemoryKVStore } from "@keplr-wallet/common";
import { Coin, Int } from "@keplr-wallet/unit";
import {
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
  QueriesStore,
} from "@osmosis-labs/keplr-stores";
import { when } from "mobx";
import WebSocket from "ws";

import {
  AccountStore,
  ChainStore,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
  OsmosisQueries,
} from "..";
import { DeliverTxResponse } from "../account/types";
import { ObservableQueryPool } from "../queries-external/pools";
import { MockAssetList, MockChainList, TestOsmosisChainId } from "./mock-data";
import { TestWallet, testWalletInfo } from "./test-wallet";

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, OsmosisQueries]
  >;
  public readonly accountStore: AccountStore<
    [OsmosisAccount, CosmosAccount, CosmwasmAccount]
  >;

  constructor({
    // osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks
    mnemonic = "notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius",
  }: {
    mnemonic?: string;
  } = {}) {
    this.chainStore = new ChainStore(
      MockChainList.map((chain) => chain.keplrChain),
      "osmosis-1"
    );

    this.queriesStore = new QueriesStore(
      new MemoryKVStore("store_web_queries"),
      this.chainStore,
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      OsmosisQueries.use(TestOsmosisChainId, "http://localhost:3000")
    );

    const testWallet = new TestWallet(testWalletInfo, mnemonic);

    this.accountStore = new AccountStore(
      MockChainList,
      TestOsmosisChainId,
      MockAssetList,
      [testWallet],
      this.queriesStore,
      this.chainStore,
      {
        broadcastUrl: "http://127.0.0.1:1317/cosmos/tx/v1beta1/txs",
        simulateUrl: "http://127.0.0.1:1317/cosmos/tx/v1beta1/simulate",
        wsObject: WebSocket as any,
      },
      OsmosisAccount.use({ queriesStore: this.queriesStore }),
      CosmosAccount.use({
        queriesStore: this.queriesStore,
      }),
      CosmwasmAccount.use({ queriesStore: this.queriesStore })
    );
  }
}

export async function initAccount(
  accountStore: AccountStore<any>,
  chainId: string
) {
  return accountStore.getWalletRepo(chainId).connect(testWalletInfo.name, true);
}

export async function waitAccountLoaded(
  account: ReturnType<AccountStore["getWallet"]>
) {
  if (account?.isReadyToSendTx || !account) {
    return;
  }

  const resolution = when(
    () =>
      account.isReadyToSendTx && account.walletStatus === WalletStatus.Connected
  );

  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolution.cancel();
      reject(new Error("Timeout waitAccountLoaded"));
    }, 10_000);

    resolution.then(() => {
      resolve();
    });
  });
}

export function getEventFromTx(tx: DeliverTxResponse, type: string): any {
  return JSON.parse(tx.rawLog ?? "")[0].events.find(
    (e: any) => e.type === type
  );
}

export function getAttributeFromEvent(event: any, name: string): any {
  return event.attributes.find((a: any) => a.key === name);
}

// get map of the amounts transferred in our out
// key is the denom, value is the total amount transferred
export function getAmountsTransferredMapFromEvent(attributes: any): any {
  const actualAmountsMapByDenom: Map<string, Int> = new Map();
  attributes.forEach((attr: any) => {
    const coin = Coin.parse(attr.value);

    let newMapValue = coin.amount;
    if (actualAmountsMapByDenom.has(coin.denom)) {
      newMapValue = newMapValue.add(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        actualAmountsMapByDenom.get(coin.denom)!
      );
    }

    actualAmountsMapByDenom.set(coin.denom, newMapValue);
  });

  return actualAmountsMapByDenom;
}

function deepContainedObj(obj1: any, obj2: any): boolean {
  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return obj1 === obj2;
  }

  for (const key of Object.keys(obj1)) {
    const value1 = obj1[key];
    const value2 = obj2[key];
    if (!deepContainedObj(value1, value2)) {
      return false;
    }
  }

  return true;
}

function deepContainedArray(array1: any, array2: any): boolean {
  if (!Array.isArray(array1) || !Array.isArray(array2)) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    const obj1 = array1[i];
    let passed = false;

    for (let j = 0; j < array2.length; j++) {
      const obj2 = array2[j];

      if (Array.isArray(obj1) || Array.isArray(obj2)) {
        if (deepContainedArray(obj1, obj2)) {
          passed = true;
          break;
        }
      } else if (deepContainedObj(obj1, obj2)) {
        passed = true;
        break;
      }
    }

    if (!passed) {
      return false;
    }
  }

  return true;
}

/** Recursive pattern match of raw values between two arbitrary objects.
 *  Throws on mismatch.
 */
export function deepContained(obj1: any, obj2: any) {
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    if (!deepContainedArray(obj1, obj2)) {
      throw new Error(
        `obj1 is not included in obj2: (obj1 - ${JSON.stringify(
          obj1
        )}, obj2 - ${JSON.stringify(obj2)})`
      );
    }
  } else if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    if (obj1 !== obj2) {
      throw new Error(
        `obj1 is not included in obj2: (obj1 - ${JSON.stringify(
          obj1
        )}, obj2 - ${JSON.stringify(obj2)})`
      );
    }
  } else {
    for (const key of Object.keys(obj1)) {
      const value1 = obj1[key];
      const value2 = obj2[key];
      deepContained(value1, value2);
    }
  }
}

export async function getLatestQueryPool(
  chainId: string,
  queryStore: IQueriesStore<OsmosisQueries>
): Promise<ObservableQueryPool> {
  // refresh stores

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const osmosisQueries = queryStore.get(chainId).osmosis!;
  const queryNumPools = osmosisQueries.queryGammNumPools;
  const queryPools = osmosisQueries.queryPools;

  await queryNumPools.waitFreshResponse();
  await queryPools.waitFreshResponse();

  // wait for desired observable state
  await when(
    () => Boolean(queryNumPools.response) && Boolean(queryPools.response)
  );

  if (queryNumPools.numPools === 0) {
    throw new Error("No pool exists");
  }

  // set poolId
  const numPools = osmosisQueries.queryGammNumPools.numPools;
  const poolId = numPools.toString(); // most recent pool id

  // get query pool

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return osmosisQueries.queryPools.getPool(poolId)!;
}
