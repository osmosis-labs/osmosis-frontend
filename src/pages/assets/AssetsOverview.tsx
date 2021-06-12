import React, { FunctionComponent } from 'react';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { Dec } from '@keplr-wallet/unit';

export const AssetsOverview: FunctionComponent<{ title: string }> = observer(({ title }) => {
	const { chainStore, accountStore, queriesStore, priceStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const queryBalances = queries.queryBalances.getQueryBech32Address(account.bech32Address);

	let availableBalancePrice = new PricePretty(priceStore.getFiatCurrency('usd')!, new Dec(0));
	for (const bal of queryBalances.balances) {
		if (bal.balance.currency.coinMinimalDenom.startsWith('gamm/pool/')) {
			const poolId = bal.balance.currency.coinMinimalDenom.replace('gamm/pool/', '');
			const pool = queries.osmosis.queryGammPools.getPool(poolId);
			if (pool) {
				const tvl = pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!);
				const totalShare = pool.totalShare;
				if (tvl.toDec().gt(new Dec(0)) && totalShare.toDec().gt(new Dec(0))) {
					const value = tvl.mul(bal.balance.quo(totalShare));
					availableBalancePrice = availableBalancePrice.add(value);
				}
			}
		} else {
			const price = priceStore.calculatePrice('usd', bal.balance);
			if (price) {
				availableBalancePrice = availableBalancePrice.add(price);
			}
		}
	}

	let lockedBalancePrice = new PricePretty(priceStore.getFiatCurrency('usd')!, new Dec(0));
	const lockedCoins = queries.osmosis.queryLockedCoins.get(account.bech32Address).lockedCoins;
	for (const locked of lockedCoins) {
		if (locked.currency.coinMinimalDenom.startsWith('gamm/pool/')) {
			const poolId = locked.currency.coinMinimalDenom.replace('gamm/pool/', '');
			const pool = queries.osmosis.queryGammPools.getPool(poolId);
			if (pool) {
				const tvl = pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!);
				const totalShare = pool.totalShare;
				if (tvl.toDec().gt(new Dec(0)) && totalShare.toDec().gt(new Dec(0))) {
					const value = tvl.mul(locked.quo(totalShare));
					lockedBalancePrice = lockedBalancePrice.add(value);
				}
			}
		} else {
			const price = priceStore.calculatePrice('usd', locked);
			if (price) {
				lockedBalancePrice = lockedBalancePrice.add(price);
			}
		}
	}

	return (
		<section className="w-full">
			<div className="flex items-center mb-6">
				<h4 className="mr-0.5">{title}</h4>
			</div>
			<div className="flex items-center gap-21.5">
				<OverviewLabelValue label="Total Assets">
					<h4 className="inline">{availableBalancePrice.add(lockedBalancePrice).toString()}</h4>
				</OverviewLabelValue>
				<OverviewLabelValue label="Available Assets">
					<h4 className="inline">{availableBalancePrice.toString()}</h4>
				</OverviewLabelValue>
				<OverviewLabelValue label="Locked Assets">
					<h4 className="inline">{lockedBalancePrice.toString()}</h4>
				</OverviewLabelValue>
			</div>
		</section>
	);
});
