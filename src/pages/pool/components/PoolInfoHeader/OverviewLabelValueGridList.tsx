import styled from '@emotion/styled';
import { CoinPretty, Dec, DecUtils } from '@keplr-wallet/unit';
import { chunk } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { OverviewLabelValue } from 'src/components/common/OverviewLabelValue';
import { PreferHeaderShowTokenPricePoolIds } from 'src/config';
import { useStore } from 'src/stores';

interface Props {
	poolId: string;
}
export const OverviewLabelValueGridList = observer(function OverviewLabelGridList({ poolId }: Props) {
	const { chainStore, queriesStore, priceStore, accountStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const pool = queries.osmosis.queryGammPools.getPool(poolId);

	const account = accountStore.getAccount(chainStore.current.chainId);
	const shareRatio = queries.osmosis.queryGammPoolShare.getAllGammShareRatio(account.bech32Address, poolId);

	const locked = queries.osmosis.queryGammPoolShare
		.getLockedGammShare(account.bech32Address, poolId)
		.add(queries.osmosis.queryGammPoolShare.getUnlockableGammShare(account.bech32Address, poolId));
	const actualLockedRatio = pool ? locked.quo(pool.totalShare) : new Dec(0);

	// `shareRatio`가 백분률로 오기 때문에 10^2를 나눠줘야한다.
	const actualRatio = shareRatio.toDec().quo(DecUtils.getPrecisionDec(2));

	const overviewLabels: {
		label: string;
		content: string;
	}[] = [];

	if (!pool) {
		return null;
	}

	if (!PreferHeaderShowTokenPricePoolIds[pool.id]) {
		overviewLabels.push({
			label: 'Pool Liquidity',
			content: pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!).toString(),
		});
		overviewLabels.push({
			label: 'Bonded',
			content: pool
				.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!)
				.mul(actualLockedRatio)
				.toString(),
		});
		overviewLabels.push({
			label: 'My Liquidity',
			content: (() => {
				const tvl = pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!);

				return tvl.mul(actualRatio).toString();
			})(),
		});
		overviewLabels.push({
			label: 'Swap Fee',
			content: pool.swapFee.toString() + '%',
		});

		if (!pool.exitFee.toDec().equals(new Dec(0))) {
			overviewLabels.push({
				label: '',
				content: '',
			});
			overviewLabels.push({
				label: 'Exit Fee',
				content: pool.exitFee.toString() + '%',
			});
		}
	} else {
		const baseDenom = PreferHeaderShowTokenPricePoolIds[pool.id]!.baseDenom;
		const baseCurrency = chainStore.currentFluent.forceFindCurrency(baseDenom);
		overviewLabels.push({
			label: 'Price',
			content:
				priceStore
					.calculatePrice('usd', new CoinPretty(baseCurrency, DecUtils.getPrecisionDec(baseCurrency.coinDecimals)))
					?.toString() ?? '$0',
		});
		overviewLabels.push({
			label: 'Pool Liquidity',
			content: pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!).toString(),
		});
		overviewLabels.push({
			label: '',
			content: '',
		});
		overviewLabels.push({
			label: 'Swap Fee',
			content: pool.swapFee.toString() + '%',
		});
		if (!pool.exitFee.toDec().equals(new Dec(0))) {
			overviewLabels.push({
				label: '',
				content: '',
			});
			overviewLabels.push({
				label: 'Exit Fee',
				content: pool.exitFee.toString() + '%',
			});
		}
	}

	return (
		<OverviewLabelValueGridListContainer>
			{chunk(overviewLabels, 2).map((labels, index) => {
				return (
					<GridCol key={index.toString()}>
						{labels[0] ? (
							labels[0].label !== '' ? (
								<OverviewLabelValue label={labels[0].label}>
									{labels[0].content !== '' ? <h4>{labels[0].content}</h4> : <h4>&#8203;</h4>}
								</OverviewLabelValue>
							) : (
								<OverviewLabelValue label="&#8203;">
									{labels[0].content !== '' ? <h4>{labels[0].content}</h4> : <h4>&#8203;</h4>}
								</OverviewLabelValue>
							)
						) : null}
						{labels[1] ? (
							labels[1].label !== '' ? (
								<OverviewLabelValue label={labels[1].label}>
									{labels[1].content !== '' ? <h6>{labels[1].content}</h6> : <h6>&#8203;</h6>}
								</OverviewLabelValue>
							) : (
								<OverviewLabelValue label="&#8203;">
									{labels[1].content !== '' ? <h6>{labels[1].content}</h6> : <h6>&#8203;</h6>}
								</OverviewLabelValue>
							)
						) : null}
					</GridCol>
				);
			})}
		</OverviewLabelValueGridListContainer>
	);
});

const OverviewLabelValueGridListContainer = styled.div`
	display: flex;
	gap: 80px;
`;

const GridCol = styled.ul`
	display: flex;
	flex-direction: column;
	gap: 24px;
`;
