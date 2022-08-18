import { ChainInfoWithExplorer } from "../stores/chain";
import { AppCurrency } from "@keplr-wallet/types";
import { PeggedCurrency } from "../stores/assets";

import { assets, chains } from 'chain-registry';
import { chainRegistryChainToKeplr } from '@chain-registry/keplr';
import { ChainInfo } from '@keplr-wallet/types';


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

export function getAllChainInfos(chain_names: string[]){
  for (const chainname of chain_names) {

    // chainRegistryChainToKeplr(chain, assets);

    const chain = chains.find(({chain_name})=>chain_name===chainname);

    if (chain) {
      const config: ChainInfo = chainRegistryChainToKeplr(chain, assets);

    }

    // const asset = assets.find(({chain_name})=>chain_name==='osmosis');


    
    // const config: ChainInfo = chainRegistryChainToKeplr(chain, assets);

    // // you can add options as well to choose endpoints 
    // const config: ChainInfo = chainRegistryChainToKeplr(chain, assets, {
    //     getExplorer: () => 'https://myexplorer.com',
    //     getRestEndpoint: (chain) => chain.apis?.rest[1]?.address
    //     getRpcEndpoint: (chain) => chain.apis?.rpc[1]?.address
    // });
  }
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
