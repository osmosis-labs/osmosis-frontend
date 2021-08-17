import React, { FunctionComponent } from 'react';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import dayjs from 'dayjs';
import { DisplayLeftTime } from '../../components/common/DisplayLeftTime';
import { Dec, IntPretty } from '@keplr-wallet/unit';

export const AirdropOverview: FunctionComponent = observer(() => {
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const unclaimed = queries.osmosis.queryTotalClaimable
		.get(account.bech32Address)
		.amountOf(chainStore.current.stakeCurrency.coinMinimalDenom);

	return (
		<section className="w-full">
			<div className="flex items-center mb-6">
				<h4 className="mr-0.5">Claim Airdrop</h4>
			</div>
			<div className="grid grid-cols-3">
				<OverviewLabelValue label="Unclaimed Airdrop">
					<div className="inline">
						<h4 className="inline">
							{unclaimed
								.trim(true)
								.shrink(true)
								.hideDenom(true)
								.toString()}
						</h4>
						<h6 className="inline"> {unclaimed.currency.coinDenom}</h6>
					</div>
				</OverviewLabelValue>
				<DisplayCliff />
			</div>
		</section>
	);
});

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

const DisplayCliff: FunctionComponent = observer(() => {
	const { chainStore, queriesStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);

	const [dummy, setRerender] = React.useState(true);
	React.useEffect(() => {
		const interval = setInterval(() => {
			setRerender(v => !v);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const timeUntilDecay = queries.osmosis.queryClaimParams.timeUntilDecay;
	const timeUntilDecayEnd = queries.osmosis.queryClaimParams.timeUntilDecayEnd;
	const durationOfDecay = queries.osmosis.queryClaimParams.durationOfDecay;

	const decayStarted = dayjs(timeUntilDecay).isBefore(Date.now());

	const untilDecay = (() => {
		const delta = dayjs.duration(dayjs(timeUntilDecay).diff(dayjs(new Date()), 'second'), 'second');
		if (delta.asSeconds() <= 0) {
			return '00-00-00';
		}
		return `${padTwoDigit(delta.months() * 30 + delta.days())}-${padTwoDigit(delta.hours())}-${padTwoDigit(
			delta.minutes()
		)}`;
	})();

	const untilDecayEnd = (() => {
		const delta = dayjs.duration(dayjs(timeUntilDecayEnd).diff(dayjs(new Date()), 'second'), 'second');
		if (delta.asSeconds() <= 0) {
			return '00-00-00';
		}
		return `${padTwoDigit(delta.months() * 30 + delta.days())}-${padTwoDigit(delta.hours())}-${padTwoDigit(
			delta.minutes()
		)}`;
	})();

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
		<React.Fragment>
			{decayStarted ? (
				<OverviewLabelValue label="Current Decay Factor">
					<div className="inline">
						<h4 className="inline">
							{decayingFactor
								.maxDecimals(1)
								.trim(true)
								.toString()}
						</h4>
						<h6 className="inline">{' %'}</h6>
					</div>
				</OverviewLabelValue>
			) : null}
			<OverviewLabelValue label={decayStarted ? 'Time to Airdrop Decay Completion' : 'Time to Airdrop Decay'}>
				<DisplayLeftTime day={day} hour={hour} minute={minute} />
			</OverviewLabelValue>
		</React.Fragment>
	);
});
