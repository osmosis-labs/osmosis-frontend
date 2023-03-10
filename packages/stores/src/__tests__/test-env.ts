/* eslint-disable */
import Axios from "axios";
import { autorun } from "mobx";
import { exec } from "child_process";
import { Buffer } from "buffer";
import { StdTx } from "@cosmjs/launchpad";
import WebSocket from "ws";
import {
  AccountSetBase,
  AccountStore,
  QueriesStore,
  CosmosQueries,
  CosmwasmQueries,
  CosmosAccount,
  CosmwasmAccount,
  ChainStore,
  WalletStatus,
} from "@keplr-wallet/stores";
import { ChainInfo } from "@keplr-wallet/types";
import { MemoryKVStore } from "@keplr-wallet/common";
import { MockKeplr } from "@keplr-wallet/provider-mock";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { OsmosisQueries, OsmosisAccount } from "..";

export const chainId = "localosmosis";

export const TestChainInfos: ChainInfo[] = [
  {
    rpc: "http://127.0.0.1:26657",
    rest: "http://127.0.0.1:1317",
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
    mnemonic = "notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius"
  ) {
    const mockKeplr = new MockKeplr(
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
              mode: "BROADCAST_MODE_BLOCK",
            }
          : {
              tx,
              mode: "block",
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
            setTimeout(resolve, 500);
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
      OsmosisQueries.use(chainId)
    );

    this.accountStore = new AccountStore(
      {
        // No need
        addEventListener: () => {},
        removeEventListener: () => {},
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
      OsmosisAccount.use({ queriesStore: this.queriesStore }) as any
    );
  }
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

export async function initLocalnet(): Promise<void> {
  const delay = (time: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  };

  // Wait some time to clear the prior websocket connections.
  await delay(500);

  await new Promise<void>((resolve, reject) => {
    exec(
      // change osmosisd version in /localnet/Dockerfile
      // comment to speed up test time
      `docker build --tag osmosis/localnet ./localnet &&
       docker rm --force osmosis_localnet && 
       docker run -d -p 1317:1317 -p 26657:26657 -p 9090:9090 --user root --name osmosis_localnet osmosis/localnet`,
      (error, _stdout, _stderr) => {
        if (error) {
          reject(new Error(`run localnet error: ${error.message}`));
          return;
        }

        resolve();
      }
    );
  });

  const instance = Axios.create({
    baseURL: "http://127.0.0.1:1317",
  });

  // Wait until the genesis block processed
  while (true) {
    await delay(500);
    try {
      const result = await instance.get<{
        block: any;
      }>("/blocks/latest");
      if (!result?.data?.block) {
        throw new Error("Chain started, but not yet initialized");
      }
    } catch {
      continue;
    }

    return;
  }
}

export async function removeLocalnet() {
  await new Promise<void>((resolve, reject) => {
    exec(`docker rm --force osmosis_localnet`, (error, _stdout, _stderr) => {
      if (error) {
        reject(new Error(`remove localnet error: ${error.message}`));
        return;
      }

      resolve();
    });
  });
}

export async function waitAccountLoaded(account: AccountSetBase) {
  if (account.isReadyToSendTx) {
    return;
  }

  return new Promise<void>((resolve) => {
    const disposer = autorun(() => {
      if (
        account.isReadyToSendTx &&
        account.walletStatus === WalletStatus.Loaded
      ) {
        resolve();
        disposer();
      }
    });
  });
}
