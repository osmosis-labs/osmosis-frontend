/* eslint-disable import/no-extraneous-dependencies */
import { Chain } from "@chain-registry/types";
import { WalletStatus } from "@cosmos-kit/core";
import { MemoryKVStore } from "@keplr-wallet/common";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  ChainStore,
  CosmosQueries,
  CosmwasmQueries,
  IQueriesStore,
  QueriesStore,
} from "@keplr-wallet/stores";
import { ChainInfo } from "@keplr-wallet/types";
import { assets } from "chain-registry";
import { when } from "mobx";
import WebSocket from "ws";

import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  ObservableQueryPool,
  OsmosisAccount,
  OsmosisQueries,
} from "..";
import { DeliverTxResponse } from "../account/types";
import { TestWallet, testWalletInfo } from "./test-wallet";

export const chainId = "localosmosis";

export const TestChainInfos: (ChainInfo & Chain)[] = [
  {
    rpc: "http://127.0.0.1:26657",
    rest: "http://127.0.0.1:1317",
    chainId: chainId,
    chainName: "OSMOSIS",
    /** Cosmoskit required properties */
    chain_id: chainId,
    chain_name: "OSMOSIS",
    pretty_name: "Osmosis",
    status: "live",
    bech32_prefix: "osmo",
    slip44: 118,
    network_type: "mainnet",
    apis: {
      rpc: [
        {
          address: "http://127.0.0.1:26657",
        },
      ],
      rest: [
        {
          address: "http://127.0.0.1:1317",
        },
      ],
    },
    /** End of Cosmoskit required properties */
    stakeCurrency: {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("osmo"),
    currencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
      },
      {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
      },
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
      },
      {
        coinDenom: "FOO",
        coinMinimalDenom: "ufoo",
        coinDecimals: 6,
      },
      {
        coinDenom: "BAR",
        coinMinimalDenom: "ubar",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
      },
    ],
    features: ["stargate", "no-legacy-stdTx", "ibc-go"],
  },
];

export class RootStore {
  public readonly chainStore: ChainStore;
  public readonly queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, OsmosisQueries]
  >;
  public readonly accountStore: AccountStore<
    [OsmosisAccount, CosmosAccount, CosmwasmAccount]
  >;

  constructor(
    // osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks
    mnemonic = "notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius"
  ) {
    this.chainStore = new ChainStore(TestChainInfos as unknown as ChainInfo[]);

    this.queriesStore = new QueriesStore(
      new MemoryKVStore("store_web_queries"),
      this.chainStore,
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      OsmosisQueries.use(chainId, true)
    );

    const testWallet = new TestWallet(testWalletInfo, mnemonic);

    this.accountStore = new AccountStore(
      TestChainInfos,
      assets,
      [testWallet],
      this.queriesStore,
      this.chainStore,
      {
        broadcastUrl: "http://127.0.0.1:1317/cosmos/tx/v1beta1/txs",
        wsObject: WebSocket as any,
      },
      OsmosisAccount.use({ queriesStore: this.queriesStore }),
      CosmosAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: () => ({ ibcTransfer: { gas: 130000 } }),
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
