import React, { FunctionComponent } from 'react';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { CoinPretty, Dec } from '@keplr-wallet/unit';

export const AssetsOverview: FunctionComponent<{ title: string }> = observer(({ title }) => {
	const { chainStore, accountStore, queriesStore, priceStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const availableBalanceList = queries.queryBalances
		.getQueryBech32Address(account.bech32Address)
		.balances.map(bal => bal.balance);
	const availableBalancePrice = calcTotalFiatValue(availableBalanceList);

	const lockedCoins = queries.osmosis.queryLockedCoins.get(account.bech32Address).lockedCoins;
	const lockedBalancePrice = calcTotalFiatValue(lockedCoins);

	const delegatedBalance = queries.cosmos.queryDelegations
		.getQueryBech32Address(account.bech32Address)
		.delegationBalances.map(delegation => delegation.balance);
	const delegatedBalancePrice = calcTotalFiatValue(delegatedBalance);

	return (
		<section className="w-full">
			<div className="flex items-center mb-6">
				<h4 className="mr-0.5">{title}</h4>
			</div>
			<div className="flex items-center gap-21.5">
				<OverviewLabelValue label="Total Assets">
					<h4 className="inline">
						{availableBalancePrice
							.add(lockedBalancePrice)
							.add(delegatedBalancePrice)
							.toString()}
					</h4>
				</OverviewLabelValue>
				<OverviewLabelValue label="Available Assets">
					<h4 className="inline">{availableBalancePrice.toString()}</h4>
				</OverviewLabelValue>
				<OverviewLabelValue label="Bonded Assets">
					<h4 className="inline">{lockedBalancePrice.toString()}</h4>
				</OverviewLabelValue>
				<OverviewLabelValue label="Staked OSMO">
					<h4 className="inline">{delegatedBalancePrice.toString()}</h4>
				</OverviewLabelValue>
			</div>
		</section>
	);

	function calcTotalFiatValue(balanceList: CoinPretty[]) {
		let fiatValue = new PricePretty(priceStore.getFiatCurrency('usd')!, new Dec(0));
		for (const balance of balanceList) {
			if (balance.currency.coinMinimalDenom.startsWith('gamm/pool/')) {
				const poolId = balance.currency.coinMinimalDenom.replace('gamm/pool/', '');
				const pool = queries.osmosis.queryGammPools.getPool(poolId);
				if (pool) {
					const tvl = pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!);
					const totalShare = pool.totalShare;
					if (tvl.toDec().gt(new Dec(0)) && totalShare.toDec().gt(new Dec(0))) {
						const value = tvl.mul(balance.quo(totalShare));
						fiatValue = fiatValue.add(value);
					}
				}
			} else {
				const price = priceStore.calculatePrice('usd', balance);
				if (price) {
					fiatValue = fiatValue.add(price);
				}
			}
		}
		return fiatValue;
	}
});
