import styled from '@emotion/styled';
import { CoinPretty, Dec, DecUtils, IntPretty } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { OverviewLabelValue } from 'src/components/common/OverviewLabelValue';
import { SubTitleText, TitleText } from 'src/components/Texts';
import { PreferHeaderShowTokenPricePoolIds } from 'src/config';
import { usePoolSwapFeeData } from 'src/hooks/pool/usePoolSwapFeeData';
import useWindowSize from 'src/hooks/useWindowSize';
import { useStore } from 'src/stores';

interface Props {
	poolId: string;
}

export const OverviewLabelValueGridList = observer(function OverviewLabelGridList({ poolId }: Props) {
	const { chainStore, queriesStore, priceStore, accountStore } = useStore();

	const { isMobileView } = useWindowSize();

	const queries = queriesStore.get(chainStore.current.chainId);
	const pool = queries.osmosis.queryGammPools.getPool(poolId);

	const account = accountStore.getAccount(chainStore.current.chainId);
	const shareRatio = queries.osmosis.queryGammPoolShare.getAllGammShareRatio(account.bech32Address, poolId);

	const locked = queries.osmosis.queryGammPoolShare.getLockedGammShare(account.bech32Address, poolId);
	const actualLockedRatio = pool ? locked.quo(pool.totalShare) : new Dec(0);

	const swapFeeData = usePoolSwapFeeData(poolId);
	const fiat = priceStore.getFiatCurrency('usd');
	let feeApy: IntPretty | undefined = undefined;

	// `shareRatio`가 백분률로 오기 때문에 10^2를 나눠줘야한다.
	const actualRatio = shareRatio.toDec().quo(DecUtils.getPrecisionDec(2));

	const firstOverviews: {
		label: string;
		content: string;
	}[] = [];
	const secondOverviews: {
		label: string;
		content: string;
	}[] = [];

	if (!pool || !fiat) {
		return null;
	}

	if (swapFeeData.data) {
		feeApy = pool.computeFeeApy(swapFeeData.data.data[0], priceStore, fiat);
	}

	if (!PreferHeaderShowTokenPricePoolIds[pool.id]) {
		firstOverviews.push({
			label: 'Pool Liquidity',
			content: pool.computeTotalValueLocked(priceStore, fiat).toString(),
		});
		firstOverviews.push({
			label: 'My Liquidity',
			content: (() => {
				const tvl = pool.computeTotalValueLocked(priceStore, fiat);

				return tvl.mul(actualRatio).toString();
			})(),
		});

		secondOverviews.push({
			label: 'Bonded',
			content: pool
				.computeTotalValueLocked(priceStore, fiat)
				.mul(actualLockedRatio)
				.toString(),
		});
		secondOverviews.push({
			label: 'Swap Fee',
			content: pool.swapFee.toString() + '%',
		});

		if (!pool.exitFee.toDec().equals(new Dec(0))) {
			secondOverviews.push({
				label: 'Exit Fee',
				content: pool.exitFee.toString() + '%',
			});
		}
	} else {
		const baseDenom = PreferHeaderShowTokenPricePoolIds[pool.id]!.baseDenom;
		const baseCurrency = chainStore.currentFluent.forceFindCurrency(baseDenom);
		firstOverviews.push({
			label: 'Price',
			content:
				priceStore
					.calculatePrice(new CoinPretty(baseCurrency, DecUtils.getPrecisionDec(baseCurrency.coinDecimals)))
					?.toString() ?? '$0',
		});

		secondOverviews.push({
			label: 'Pool Liquidity',
			content: pool.computeTotalValueLocked(priceStore, fiat).toString(),
		});
		secondOverviews.push({
			label: 'Swap Fee',
			content: pool.swapFee.toString() + '%',
		});

		if (!pool.exitFee.toDec().equals(new Dec(0))) {
			secondOverviews.push({
				label: 'Exit Fee',
				content: pool.exitFee.toString() + '%',
			});
		}
	}

	if (feeApy) {
		secondOverviews.push({
			label: 'Fee APY',
			content: feeApy.toString() + '%',
		});
	}

	return (
		<OverviewLabelValueGridListContainer>
			<FirstOverviews>
				{firstOverviews.map(overview => (
					<Overview key={overview.label}>
						<OverviewLabelValue label={overview.label}>
							<TitleText isMobileView={isMobileView} size="2xl" pb={0}>
								{overview.content !== '' ? overview.content : `&#8203;`}
							</TitleText>
						</OverviewLabelValue>
					</Overview>
				))}
			</FirstOverviews>
			<SecondOverviews>
				{secondOverviews.map(overview => (
					<Overview key={overview.label}>
						<OverviewLabelValue label={overview.label}>
							<SubTitleText isMobileView={isMobileView} pb={0}>
								{overview.content !== '' ? overview.content : `&#8203;`}
							</SubTitleText>
						</OverviewLabelValue>
					</Overview>
				))}
			</SecondOverviews>
		</OverviewLabelValueGridListContainer>
	);
});

const OverviewLabelValueGridListContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;

	@media (min-width: 768px) {
		gap: 24px;
	}
`;

const FirstOverviews = styled.ul`
	display: flex;
	flex-direction: column;
	gap: 12px;

	@media (min-width: 768px) {
		flex-direction: row;
		gap: 80px;
	}
`;

const SecondOverviews = styled.ul`
	display: flex;
	gap: 20px;

	@media (min-width: 768px) {
		gap: 80px;
	}
`;

const Overview = styled.li`
	display: flex;
`;
