import { ChainInfoWithExplorer } from "../stores/chain";
import { AppCurrency } from "@keplr-wallet/types";
import { PeggedCurrency } from "../stores/assets";

import { assets, chains } from 'chain-registry';
import { chainRegistryChainToKeplr } from '@chain-registry/keplr';
import { ChainInfo } from '@keplr-wallet/types';
import IBCAssetInfos from "./ibc-assets";



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

export function getAllChainInfosFromAssets() : ChainInfoWithExplorer[] {

  let seen_chain_names = new Set<string>();
  var chain_infos: ChainInfoWithExplorer[] = []
  
  const osmosis = chains.find(({chain_name})=>chain_name==="osmosis");
  if (osmosis) {
    chain_infos.push(chainRegistryChainToKeplr(osmosis, assets) as ChainInfoWithExplorer);
    seen_chain_names.add("osmosis");
  }
  
  for (const asset of IBCAssetInfos) {
    if(!seen_chain_names.has(asset.sourceChainName)){
      seen_chain_names.add(asset.sourceChainName)

      console.log(asset.sourceChainName);

      const chain = chains.find(({chain_name})=>chain_name===asset.sourceChainName);
      if (chain) {
        chain_infos.push(chainRegistryChainToKeplr(chain, assets) as ChainInfoWithExplorer);
      }
      else {
        console.log("could not find");
      }
    }
  }

  console.log(chain_infos);

  return chain_infos
}

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
