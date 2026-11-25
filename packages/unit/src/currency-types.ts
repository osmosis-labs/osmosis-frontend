// Adapted from @keplr-wallet/types@0.10.24 (Apache-2.0).

/**
 * The currency that is supported on the chain natively.
 */
export interface Currency {
  readonly coinDenom: string;
  readonly coinMinimalDenom: string;
  readonly coinDecimals: number;
  /**
   * This is used to fetch asset's fiat value from coingecko.
   * You can get id from https://api.coingecko.com/api/v3/coins/list.
   */
  readonly coinGeckoId?: string;
  readonly coinImageUrl?: string;
}

/**
 * A CW-20 token. `coinMinimalDenom` must start with the type and contract
 * address, e.g. "cw20:osmo1…:utoken".
 */
export interface CW20Currency extends Currency {
  readonly type: "cw20";
  readonly contractAddress: string;
}

export interface Secret20Currency extends Currency {
  readonly type: "secret20";
  readonly contractAddress: string;
  readonly viewingKey: string;
}

/**
 * A currency sent from another chain over IBC, with the channel path it took.
 */
export interface IBCCurrency extends Currency {
  readonly paths: {
    portId: string;
    channelId: string;
  }[];
  /** The chain the currency is from, or undefined if that chain is unknown. */
  readonly originChainId: string | undefined;
  readonly originCurrency:
    | Currency
    | CW20Currency
    | Secret20Currency
    | undefined;
}

export type AppCurrency =
  | Currency
  | CW20Currency
  | Secret20Currency
  | IBCCurrency;

export interface FiatCurrency {
  readonly currency: string;
  readonly symbol: string;
  readonly maxDecimals: number;
  readonly locale: string;
}
