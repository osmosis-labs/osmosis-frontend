import { ASSET_LIST_COMMIT_HASH } from "../../env";
import { queryGithubFile } from "./file";

type Bech32Config = {
  bech32PrefixAccAddr: string;
  bech32PrefixAccPub: string;
  bech32PrefixValAddr: string;
  bech32PrefixValPub: string;
  bech32PrefixConsAddr: string;
  bech32PrefixConsPub: string;
};

type Currency = {
  coinDenom: string;
  /** Prefer over `coinMinimalDenom` */
  chainSuggestionDenom: string;
  /** Prefer `chainSuggestionDenom` */
  coinMinimalDenom?: string;
  sourceDenom?: string;
  coinDecimals: number;
  coinGeckoId?: string;
  coinImageUrl?: string;
};

type FeeCurrency = Currency & {
  gasPriceStep: {
    low: number;
    average: number;
    high: number;
  };
};

type Api = {
  address: string;
};

type Explorer = {
  txPage: string;
};

export type Chain = {
  chain_name: string;
  status: string;
  networkType: string;
  prettyName: string;
  chain_id: string;
  bech32Prefix: string;
  bech32Config: Bech32Config;
  slip44: number;
  stakeCurrency: Currency;
  feeCurrencies: FeeCurrency[];
  currencies: Currency[];
  description: string;
  apis: {
    rpc: Api[];
    rest: Api[];
  };
  explorers: Explorer[];
  features: string[];
};

/** Fetches generated chains from Osmosis assetlists repo. */
export async function queryGeneratedChains({
  zoneChainId = "osmosis-1",
  commitHash = ASSET_LIST_COMMIT_HASH,
  repo = "osmosis-labs/assetlists",
}: {
  zoneChainId?: string;
  repo?: string;
  commitHash?: string;
} = {}): Promise<Chain[]> {
  return queryGithubFile<{ zone: string; chains: Chain[] }>({
    repo,
    commitHash,
    filePath: `${zoneChainId}/generated/frontend/chainlist.json`,
  }).then(({ chains }) => chains);
}
