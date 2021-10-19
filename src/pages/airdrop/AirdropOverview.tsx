import styled from '@emotion/styled';
import { Dec, IntPretty } from '@keplr-wallet/unit';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { DisplayLeftTime } from 'src/components/common/DisplayLeftTime';
import { OverviewLabelValue } from 'src/components/common/OverviewLabelValue';
import { SubTitleText, TitleText } from 'src/components/Texts';
import { useStore } from 'src/stores';
import useWindowSize from 'src/hooks/useWindowSize';

export const AirdropOverview = observer(function AirdropOverview() {
	const { chainStore, accountStore, queriesStore } = useStore();
	const { isMobileView } = useWindowSize();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const unclaimed = queries.osmosis.queryTotalClaimable
		.get(account.bech32Address)
		.amountOf(chainStore.current.stakeCurrency.coinMinimalDenom);

	return (
		<AirdropOverviewContainer>
			<TitleText size="2xl" isMobileView={isMobileView}>
				Claim Airdrop
			</TitleText>
			<OverviewList>
				<OverviewLabelValue label="Unclaimed Airdrop">
					<span>
						<TitleText size="2xl" isMobileView={isMobileView} style={{ display: 'inline' }}>
							{unclaimed
								.trim(true)
								.shrink(true)
								.hideDenom(true)
								.toString()}
						</TitleText>
						<SubTitleText isMobileView={isMobileView} style={{ display: 'inline' }}>
							{' '}
							{unclaimed.currency.coinDenom}
						</SubTitleText>
					</span>
				</OverviewLabelValue>
				<DisplayCliff />
			</OverviewList>
		</AirdropOverviewContainer>
	);
});

const AirdropOverviewContainer = styled.section`
	width: 100%;
`;

const OverviewList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;

	@media (min-width: 768px) {
		flex-direction: row;
		gap: 80px;
	}
`;

const DisplayCliff = observer(function DisplayCliff() {
	const { chainStore, queriesStore } = useStore();
	const { isMobileView } = useWindowSize();

	const queries = queriesStore.get(chainStore.current.chainId);

	const [dummy, setRerender] = React.useState(true);
	useEffect(() => {
		const interval = setInterval(() => {
			setRerender(v => !v);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const timeUntilDecay = queries.osmosis.queryClaimParams.timeUntilDecay;
	const timeUntilDecayEnd = queries.osmosis.queryClaimParams.timeUntilDecayEnd;
	const durationOfDecay = queries.osmosis.queryClaimParams.durationOfDecay;

	const decayStarted = dayjs(timeUntilDecay).isBefore(Date.now());

	const untilDecay = formatTimeUntil(timeUntilDecay);
	const untilDecayEnd = formatTimeUntil(timeUntilDecayEnd);

	const [day, hour, minute] = decayStarted ? untilDecayEnd.split('-') : untilDecay.split('-');

	const decayingFactor = (() => {
		const elapsedFromDecay = dayjs.duration({
			seconds: dayjs(Date.now()).unix() - dayjs(timeUntilDecay).unix(),
		});

		if (elapsedFromDecay.asSeconds() <= 0) {
			return new IntPretty(new Dec('100'));
		}

		if (durationOfDecay.asSeconds() === 0) {
			return new IntPretty(new Dec('100'));
		}

		const percentile = (elapsedFromDecay.asSeconds() / durationOfDecay.asSeconds()) * 100;
		return new IntPretty(new Dec('100').sub(new Dec(percentile.toFixed(4))));
	})();

	return (
		<>
			{decayStarted ? (
				<OverviewLabelValue label="Current Decay Factor">
					<span>
						<TitleText size="2xl" isMobileView={isMobileView} style={{ display: 'inline' }}>
							{decayingFactor
								.maxDecimals(1)
								.trim(true)
								.toString()}
						</TitleText>
						<SubTitleText isMobileView={isMobileView} style={{ display: 'inline' }}>
							{' '}
							{' %'}
						</SubTitleText>
					</span>
				</OverviewLabelValue>
			) : null}
			<OverviewLabelValue label={decayStarted ? 'Time to Airdrop Decay Completion' : 'Time to Airdrop Decay'}>
				<DisplayLeftTime day={day} hour={hour} minute={minute} />
			</OverviewLabelValue>
		</>
	);
});

function formatTimeUntil(date: Date) {
	const delta = dayjs.duration(dayjs(date).diff(dayjs(new Date()), 'second'), 'second');
	if (delta.asSeconds() <= 0) {
		return '00-00-00';
	}
	return `${padTwoDigit(delta.months() * 30 + delta.days())}-${padTwoDigit(delta.hours())}-${padTwoDigit(
		delta.minutes()
	)}`;
}

function padTwoDigit(num: number): string {
	// Expect that num is integer
	if (num <= 0) {
		return '00';
	}
	if (num <= 9) {
		return '0' + num;
	}
	return num.toString();
}
