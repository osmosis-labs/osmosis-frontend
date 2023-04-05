/* eslint-disable */
import Axios from "axios";
import { autorun } from "mobx";
import { exec } from "child_process";
import {
  QueriesStore,
  CosmosQueries,
  CosmwasmQueries,
  ChainStore,
} from "@keplr-wallet/stores";
import { ChainInfo } from "@keplr-wallet/types";
import { MemoryKVStore } from "@keplr-wallet/common";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  OsmosisAccount,
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
} from "../account";
import { OsmosisQueries } from "../queries";
import { assets, chains } from "chain-registry";
import { WalletStatus } from "@cosmos-kit/core";
import { TestWallet, testWalletInfo } from "./test-wallet";
import { Chain } from "@chain-registry/types";

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

  constructor(mnemonic?: string) {
    this.chainStore = new ChainStore(TestChainInfos as ChainInfo[]);

    this.queriesStore = new QueriesStore(
      new MemoryKVStore("store_web_queries"),
      this.chainStore,
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      OsmosisQueries.use(chainId)
    );

    const testWallet = new TestWallet(testWalletInfo, mnemonic);

    this.accountStore = new AccountStore(
      chains,
      assets,
      [testWallet],
      this.queriesStore,
      this.chainStore,
      undefined,
      OsmosisAccount.use({ queriesStore: this.queriesStore }),
      CosmosAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: () => ({ ibcTransfer: { gas: 130000 } }),
      }),
      CosmwasmAccount.use({ queriesStore: this.queriesStore })
    );

    this.accountStore.walletManager.getWalletRepo(TestChainInfos[0].chainId);
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

export async function waitAccountLoaded(
  account: ReturnType<AccountStore["getWallet"]>
) {
  if (account!.isReadyToSendTx) {
    return;
  }

  return new Promise<void>((resolve) => {
    const disposer = autorun(() => {
      if (
        account!.isReadyToSendTx &&
        account!.walletStatus === WalletStatus.Connected
      ) {
        resolve();
        disposer();
      }
    });
  });
}
