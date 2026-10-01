// Adapted from @keplr-wallet/types@0.10.24 (Apache-2.0).
import type { AppCurrency, Currency } from "@osmosis-labs/unit";

export interface BIP44 {
  readonly coinType: number;
}

export interface Bech32Config {
  readonly bech32PrefixAccAddr: string;
  readonly bech32PrefixAccPub: string;
  readonly bech32PrefixValAddr: string;
  readonly bech32PrefixValPub: string;
  readonly bech32PrefixConsAddr: string;
  readonly bech32PrefixConsPub: string;
}

/** Chain description in the shape Keplr's `experimentalSuggestChain` accepts. */
export interface KeplrChainInfo {
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  readonly chainName: string;
  /** The currency used for staking; its details are also in `currencies`. */
  readonly stakeCurrency: Currency;
  readonly walletUrl?: string;
  readonly walletUrlForStaking?: string;
  readonly bip44: BIP44;
  readonly alternativeBIP44s?: BIP44[];
  readonly bech32Config: Bech32Config;
  readonly currencies: AppCurrency[];
  /** Currencies that can pay transaction fees; their details are also in `currencies`. */
  readonly feeCurrencies: Currency[];
  /** @deprecated slip-044 coin type, used only for ENS lookups. Use `bip44.coinType`. */
  readonly coinType?: number;
  /** Plain numbers rather than `Dec` so the value survives serialization. */
  readonly gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };
  /** Chain features, e.g. "cosmwasm". */
  readonly features?: string[];
  readonly beta?: boolean;
}
