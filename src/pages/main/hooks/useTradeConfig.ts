import { ChainGetter, ObservableQueryBalances } from '@keplr-wallet/stores';
import { useState } from 'react';
import { ObservableQueryPools } from '../../../stores/osmosis/query/pools';
import { GammSwapManager } from '../../../stores/osmosis/swap';
import { TradeConfig } from '../stores/trade/config';

export const useTradeConfig = (
	chainGetter: ChainGetter,
	chainId: string,
	sender: string,
	queryBalances: ObservableQueryBalances,
	swapManager: GammSwapManager,
	queryPools: ObservableQueryPools
) => {
	const [config] = useState(
		() => new TradeConfig(chainGetter, chainId, sender, queryBalances, swapManager, queryPools)
	);
	config.setChain(chainId);
	config.setSender(sender);
	config.setQueryBalances(queryBalances);
	config.setQueryPools(queryPools);

	return config;
};
