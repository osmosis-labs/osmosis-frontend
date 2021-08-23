import styled from '@emotion/styled';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { OverviewLabelValue } from 'src/components/common/OverviewLabelValue';
import { TitleText } from 'src/components/Texts';
import { useStore } from 'src/stores';

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

	return (
		<section>
			<TitleText size="2xl">{title}</TitleText>
			<AssetsList>
				<OverviewLabelValue label="Total Assets">
					<TitleText size="2xl" pb={0}>
						{availableBalancePrice
							.add(lockedBalancePrice)
							.add(delegatedBalancePrice)
							.toString()}
					</TitleText>
				</OverviewLabelValue>

				<OverviewLabelValue label="Available Assets">
					<TitleText size="2xl" pb={0}>
						{availableBalancePrice.toString()}
					</TitleText>
				</OverviewLabelValue>

				<OverviewLabelValue label="Bonded Assets">
					<TitleText size="2xl" pb={0}>
						{lockedBalancePrice.toString()}
					</TitleText>
				</OverviewLabelValue>

				<OverviewLabelValue label="Staked OSMO">
					<TitleText size="2xl" pb={0}>
						{delegatedBalancePrice.toString()}
					</TitleText>
				</OverviewLabelValue>
			</AssetsList>
		</section>
	);
});

const AssetsList = styled.div`
	display: flex;
	align-items: center;
	gap: 86px;
`;
