import { ChainInfoWithExplorer } from "../stores/chain";
import { AppCurrency } from "@keplr-wallet/types";
import { PeggedCurrency } from "../stores/assets";

/** All currency attributes (stake and fee) are defined once in the `currencies` list.
 *  Maintains the option to skip this conversion and keep the verbose `ChainInfo` type.
 */
export type SimplifiedChainInfo = Omit<
  ChainInfoWithExplorer,
  "stakeCurrency" | "feeCurrencies"
> & {
  currencies: Array<
    AppCurrency &
      PeggedCurrency & {
        isStakeCurrency?: boolean;
        isFeeCurrency?: boolean;
      }
  >;
};

/** Convert a less redundant chain info schema into one that is accepted by Keplr's suggestChain: `ChainInfo`. */
export function createKeplrChainInfos(
  chainInfo: SimplifiedChainInfo
): ChainInfoWithExplorer {
  let feeCurrencies: AppCurrency[] = [];
  let stakeCurrency: AppCurrency | undefined;

  for (const currency of chainInfo.currencies) {
    if (currency.isFeeCurrency) {
      feeCurrencies.push(currency);
    }

    if (currency.isStakeCurrency && stakeCurrency === undefined) {
      stakeCurrency = currency;
    } else if (currency.isStakeCurrency) {
      throw new Error(
        `There cannot be more than one stake currency for ${chainInfo.chainName}`
      );
    }
  }

  if (stakeCurrency === undefined) {
    throw new Error(
      `Did not specify a stake currency for ${chainInfo.chainName}`
    );
  }

  if (feeCurrencies.length === 0) {
    throw new Error(
      `Did not specify any fee currencies for ${chainInfo.chainName}`
    );
  }

  return {
    ...chainInfo,
    stakeCurrency,
    feeCurrencies,
  };
}
