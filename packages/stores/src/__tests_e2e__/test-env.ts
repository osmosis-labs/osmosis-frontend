/* eslint-disable import/no-extraneous-dependencies */
import { StdTx } from "@cosmjs/launchpad";
import { MemoryKVStore } from "@keplr-wallet/common";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  AccountSetBase,
  AccountStore,
  ChainStore,
  CosmosAccount,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmQueries,
  IQueriesStore,
  QueriesStore,
  WalletStatus,
} from "@keplr-wallet/stores";
import { ChainInfo } from "@keplr-wallet/types";
import Axios from "axios";
import { Buffer } from "buffer";
import { when } from "mobx";
import WebSocket from "ws";

import { ObservableQueryPool, OsmosisAccount, OsmosisQueries } from "..";
import { MockKeplrWithFee } from "./mock-keplr-with-fee";

export const chainId = "localosmosis";

export const TestChainInfos: ChainInfo[] = [
  {
    rpc: "http://207.154.252.194:26657",
    rest: "http://207.154.252.194:1317",
    chainId: chainId,
    chainName: "OSMOSIS",
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
    [CosmosAccount, CosmwasmAccount, OsmosisAccount]
  >;

  constructor(
    // osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks
    mnemonic = "notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius"
  ) {
    const mockKeplr = new MockKeplrWithFee(
      async (chainId: string, tx: StdTx | Uint8Array) => {
        const chainInfo = TestChainInfos.find(
          (info) => info.chainId === chainId
        );
        if (!chainInfo) {
          throw new Error("Unknown chain info");
        }

        const restInstance = Axios.create({
          ...{
            baseURL: chainInfo.rest,
          },
        });

        const isProtoTx = Buffer.isBuffer(tx) || tx instanceof Uint8Array;

        const params = isProtoTx
          ? {
              tx_bytes: Buffer.from(tx as any).toString("base64"),
              mode: "BROADCAST_MODE_SYNC",
            }
          : {
              tx,
              mode: "sync",
            };

        try {
          const result = await restInstance.post(
            isProtoTx ? "/cosmos/tx/v1beta1/txs" : "/txs",
            params
          );

          const txResponse = isProtoTx
            ? result.data["tx_response"]
            : result.data;

          if (txResponse.code != null && txResponse.code !== 0) {
            throw new Error(txResponse["raw_log"]);
          }

          return Buffer.from(txResponse.txhash, "hex");
        } finally {
          // Sending the other tx right after the response is fetched makes the other tx be failed sometimes,
          // because actually the increased sequence is commited after the block is fully processed.
          // So, to prevent this problem, just wait more time after the response is fetched.
          await new Promise((resolve) => {
            setTimeout(resolve, 6_000);
          });
        }
      },
      TestChainInfos,
      mnemonic
    );

    this.chainStore = new ChainStore(TestChainInfos);

    this.queriesStore = new QueriesStore(
      new MemoryKVStore("store_web_queries"),
      this.chainStore,
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      OsmosisQueries.use(chainId, true)
    );

    this.accountStore = new AccountStore(
      {
        // No need
        addEventListener: () => null,
        removeEventListener: () => null,
      },
      this.chainStore,
      () => {
        return {
          suggestChain: false,
          prefetching: true,
          autoInit: true,
          getKeplr: async () => {
            return mockKeplr;
          },
          wsObject: WebSocket as any,
        };
      },
      CosmosAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: () => ({ ibcTransfer: { gas: 130000 } }),
        wsObject: WebSocket as any,
      }),
      CosmwasmAccount.use({ queriesStore: this.queriesStore }),
      OsmosisAccount.use({ queriesStore: this.queriesStore })
    );
  }
}

export async function waitAccountLoaded(account: AccountSetBase) {
  if (account.isReadyToSendTx) {
    return;
  }

  const resolution = when(
    () =>
      account.isReadyToSendTx && account.walletStatus === WalletStatus.Loaded
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

export function getEventFromTx(tx: any, type: string): any {
  return JSON.parse(tx.log)[0].events.find((e: any) => e.type === type);
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
  const queryGammPools = osmosisQueries.queryGammPools;

  await queryNumPools.waitFreshResponse();
  await queryGammPools.waitFreshResponse();

  // wait for desired observable state
  await when(
    () => Boolean(queryNumPools.response) && Boolean(queryGammPools.response)
  );

  // set poolId
  const numPools = osmosisQueries.queryGammNumPools.numPools;
  const poolId = numPools.toString(); // most recent pool id

  // get query pool

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return osmosisQueries.queryGammPools.getPool(poolId)!;
}
