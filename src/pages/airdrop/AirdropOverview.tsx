import React, { FunctionComponent } from 'react';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import dayjs from 'dayjs';
import { DisplayLeftTime } from '../../components/common/DisplayLeftTime';

export const AirdropOverview: FunctionComponent = observer(() => {
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const claimRecord = queries.osmosis.queryClaimRecord.get(account.bech32Address);

	// 1/5은 체인 시작부터 가지고 있기 때문에 실제로 에어드랍에서 받을 물량은 claim 모듈에서 5/4를 곱해줘야한다.
	const totalClaimable = claimRecord
		.initialClaimableAmountOf(chainStore.current.stakeCurrency.coinMinimalDenom)
		.mul(new Dec('1.25'));

	const completed = claimRecord.completedActions;

	// 일단 totalClaimable이 존재하지 않으면 claim 할 수 있는 사용자가 아닌 것으로 간주한다.
	// claim 할 수 있는 사용자면 위의 값에서 0.2를 곱한다.
	let claimed = totalClaimable.toDec().equals(new Dec(0))
		? new CoinPretty(totalClaimable.currency, new Dec(0))
		: totalClaimable.mul(new Dec('0.2'));
	for (const [_, value] of Object.entries(completed)) {
		if (value) {
			// 기본적으로 총 액션은 4개로 고정되어 있다. 완료된 액션마다 0.2를 곱한다.
			claimed = claimed.add(totalClaimable.mul(new Dec('0.2')));
		}
	}

	const unclaimed = totalClaimable.sub(claimed);

	return (
		<section className="w-full">
			<div className="flex items-center mb-6">
				<h4 className="mr-0.5">Claim Airdrop</h4>
			</div>
			<div className="grid grid-cols-3">
				<OverviewLabelValue label="Total Airdrop">
					<div className="inline">
						<h4 className="inline">
							{totalClaimable
								.trim(true)
								.shrink(true)
								.hideDenom(true)
								.toString()}
						</h4>
						<h6 className="inline"> {totalClaimable.currency.coinDenom}</h6>
					</div>
				</OverviewLabelValue>
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

	const untilDecay = (() => {
		const delta = dayjs.duration(
			dayjs(queries.osmosis.queryClaimParams.timeUntilDecay).diff(dayjs(new Date()), 'second'),
			'second'
		);
		if (delta.asSeconds() <= 0) {
			return '00-00-00';
		}
		return delta.format('DD-HH-mm');
	})();
	const [day, hour, minute] = untilDecay.split('-');
	return (
		<OverviewLabelValue label="Time to Airdrop Decay">
			<DisplayLeftTime day={day} hour={hour} minute={minute} />
		</OverviewLabelValue>
	);
});
