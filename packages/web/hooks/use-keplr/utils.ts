import { ChainInfo, Keplr } from "@keplr-wallet/types";

/** Suggests a chain to Keplr from the browser window.
 *
 *  Supply the full currency urls to be validated + reqested within Keplr extension context. */
export async function suggestChainFromWindow(
  keplr: Keplr,
  chainInfo: ChainInfo
) {
  if (typeof window !== "undefined") {
    const info = {
      ...chainInfo,
      stakeCurrency: {
        ...chainInfo.stakeCurrency,
        coinImageUrl: chainInfo.stakeCurrency.coinImageUrl
          ? window.origin + chainInfo.stakeCurrency.coinImageUrl
          : undefined,
      },
      currencies: chainInfo.currencies.map((currency) => ({
        ...currency,
        coinImageUrl: currency.coinImageUrl
          ? window.origin + currency.coinImageUrl
          : undefined,
      })),
      feeCurrencies: chainInfo.feeCurrencies.map((currency) => ({
        ...currency,
        coinImageUrl: currency.coinImageUrl
          ? window.origin + currency.coinImageUrl
          : undefined,
      })),
    };

    await keplr.experimentalSuggestChain(info);
  }
}
