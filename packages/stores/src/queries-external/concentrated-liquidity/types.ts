export interface QuasarVault {
  id: number;
  chainId: string;
  address: string;
  strategy: "CL Strategy";
  slug: string;
  thesis: string;
  incentivesAddr?: string;
  incentivesApy?: number;
  apy: number;
  name: string;
  symbol: string;
  decimals: number;
  total_supply: {
    amount: number;
  };
  tvl: {
    eur: number;
    usd: number;
    osmo: number;
    atom: number;
  };
  bondPrimitives: QuasarPrimitive[];
  pairPrimitives: QuasarPrimitive[];
  allPrimitives: QuasarPrimitive[];
  maxCap?: number;
  apy_spread_rewards?: number;
  apy_pool_incentives?: number;
}

export interface QuasarPrimitive {
  denom: string;
  amount: number;
  weight: number | string;
  base: string;
  name: string;
  display: string;
  symbol: string;
  price: {
    usd: number;
    eur: number;
    osmo?: number;
    atom?: number;
  };
  assetInfo: QuasarAssetInfo;
}

export interface QuasarAssetInfo {
  description: string;
  denom_units: {
    denom: string;
    exponent: number;
    aliases?: string[];
  }[];
  base: string;
  name: string;
  display: string;
  symbol: string;
  logo_URIs: {
    png?: string;
    svg?: string;
  };
  coingecko_id: string;
  keywords?: string[];
  traces?: {
    type: string;
    counterparty: {
      channel_id: string;
      base_denom: string;
      chain_name: string;
    };
    chain: {
      channel_id: string;
    };
  }[];
  price: {
    usd: number;
    eur: number;
    osmo?: number;
    atom?: number;
  };
}
