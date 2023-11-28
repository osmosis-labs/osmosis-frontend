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
import type {
  AssetList,
  Chain,
  ChainInfoWithExplorer,
} from "@osmosis-labs/types";
import { assets } from "chain-registry";
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
import { TestWallet, testWalletInfo } from "./test-wallet";

export const chainId = "localosmosis";

export const TestChainInfos: (Chain & {
  keplrChain: ChainInfoWithExplorer;
})[] = [
  {
    chain_name: "osmosis",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Osmosis",
    chain_id: "osmosis-1",
    bech32_prefix: "osmo",
    bech32_config: {
      bech32PrefixAccAddr: "osmo",
      bech32PrefixAccPub: "osmopub",
      bech32PrefixValAddr: "osmovaloper",
      bech32PrefixValPub: "osmovaloperpub",
      bech32PrefixConsAddr: "osmovalcons",
      bech32PrefixConsPub: "osmovalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uosmo",
          fixed_min_gas_price: 0.0025,
          low_gas_price: 0.0025,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uosmo",
        },
      ],
      lock_duration: {
        time: "1209600s",
      },
    },
    description:
      "Osmosis (OSMO) is a decentralized exchange (DEX) for Cosmos, an ecosystem of sovereign, interoperable blockchains all connected trustlessly over IBC, the Inter-Blockchain Communication Protocol. Osmosis also offers non-IBC assets bridged from the Ethereum and Polkadot ecosystems. Osmosis' Supercharged Liquidity implements an efficient liquidity pool mechanism analogous to Uniswap's concentrated liquidity, attaining improved capital efficiency and allowing liquidity providers to compete for earned fees and incentives.\n\nAs an appchain DEX, Osmosis has greater control over the full blockchain stack than DEXs that must follow the code of a parent chain. This fine-grained control has enabled, for example, the development of Superfluid Staking, an improvement to Proof-of-Stake security. Superfluid staking allows the underlying OSMO in an LP position to add to chain security and earn staking rewards for doing so. The customizability of appchains also allows for the development of a transaction mempool shielded with threshold encryption, which will greatly reduce harmful MEV on Osmosis.\n\nOsmosis's vision is to build a cross-chain native DEX and trading suite that connects all chains over IBC, including Ethereum and Bitcoin. To build out the trading functionalities, Osmosis has invited external developers to create a bespoke DEX ecosystem that includes lending, credit, margin, fiat on-ramps, Defi strategy vaults, NFTs, stablecoins, and more – all the functionalities of a centralized exchange and more, plus the trust-minimization of decentralized finance.",
    apis: {
      rpc: [
        {
          address: "https://rpc-osmosis.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-osmosis.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/osmosis/txs/{txHash}",
      },
    ],
    features: [
      "ibc-go",
      "ibc-transfer",
      "cosmwasm",
      "wasmd_0.24+",
      "osmosis-txfees",
    ],
    keplrChain: {
      rpc: "https://rpc-osmosis.keplr.app",
      rest: "https://lcd-osmosis.keplr.app",
      chainId: "osmosis-1",
      chainName: "osmosis",
      prettyChainName: "Osmosis",
      bip44: {
        coinType: 118,
      },
      currencies: [
        {
          coinDenom: "OSMO",
          coinMinimalDenom: "uosmo",
          coinDecimals: 6,
          coinGeckoId: "osmosis",
          coinImageUrl: "/tokens/generated/osmo.svg",
          base: "uosmo",
          gasPriceStep: {
            low: 0.0025,
            average: 0.025,
            high: 0.04,
          },
        },
        {
          coinDenom: "ION",
          coinMinimalDenom: "uion",
          coinDecimals: 6,
          coinGeckoId: "ion",
          coinImageUrl: "/tokens/generated/ion.svg",
          base: "uion",
        },
        {
          coinDenom: "IBCX",
          coinMinimalDenom:
            "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
          contractAddress:
            "osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/ibcx.svg",
          base: "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
        },
        {
          coinDenom: "stIBCX",
          coinMinimalDenom:
            "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
          contractAddress:
            "osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/stibcx.svg",
          base: "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
        },
        {
          coinDenom: "ampOSMO",
          coinMinimalDenom:
            "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
          contractAddress:
            "osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/amposmo.png",
          base: "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
        },
        {
          coinDenom: "CDT",
          coinMinimalDenom:
            "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/cdt.svg",
          base: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
        },
        {
          coinDenom: "MBRN",
          coinMinimalDenom:
            "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/mbrn.svg",
          base: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
        },
        {
          coinDenom: "sqOSMO",
          coinMinimalDenom:
            "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sqosmo.svg",
          base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
        },
        {
          coinDenom: "sqATOM",
          coinMinimalDenom:
            "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sqatom.svg",
          base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
        },
        {
          coinDenom: "sqBTC",
          coinMinimalDenom:
            "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
          coinDecimals: 6,
          coinImageUrl: "/tokens/generated/sqbtc.svg",
          base: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
        },
      ],
      stakeCurrency: {
        coinDecimals: 6,
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinGeckoId: "osmosis",
        coinImageUrl: "/tokens/generated/osmo.svg",
        base: "uosmo",
      },
      feeCurrencies: [
        {
          coinDenom: "OSMO",
          coinMinimalDenom: "uosmo",
          coinDecimals: 6,
          coinGeckoId: "osmosis",
          coinImageUrl: "/tokens/generated/osmo.svg",
          base: "uosmo",
          gasPriceStep: {
            low: 0.0025,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
      bech32Config: {
        bech32PrefixAccAddr: "osmo",
        bech32PrefixAccPub: "osmopub",
        bech32PrefixValAddr: "osmovaloper",
        bech32PrefixValPub: "osmovaloperpub",
        bech32PrefixConsAddr: "osmovalcons",
        bech32PrefixConsPub: "osmovalconspub",
      },
      explorerUrlToTx: "https://www.mintscan.io/osmosis/txs/{txHash}",
      features: [
        "ibc-go",
        "ibc-transfer",
        "cosmwasm",
        "wasmd_0.24+",
        "osmosis-txfees",
      ],
    },
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
    this.chainStore = new ChainStore(
      TestChainInfos.map((chain) => chain.keplrChain),
      "osmosis-1"
    );

    this.queriesStore = new QueriesStore(
      new MemoryKVStore("store_web_queries"),
      this.chainStore,
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      OsmosisQueries.use(chainId, "http://localhost:3000")
    );

    const testWallet = new TestWallet(testWalletInfo, mnemonic);

    this.accountStore = new AccountStore(
      TestChainInfos,
      chainId,
      assets as AssetList[],
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
