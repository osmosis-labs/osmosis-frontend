import React, { FunctionComponent } from 'react';
import { multiply } from '../../utils/Big';
import { useStore } from '../../stores';
import { CoinPretty, Dec, IntPretty } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';

export const MyAirdropProgress: FunctionComponent = observer(() => {
	const { chainStore, queriesStore, accountStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

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

	const percent = totalClaimable.toDec().equals(new Dec(0))
		? new IntPretty(new Dec(0))
		: new IntPretty(claimed.quo(totalClaimable)).decreasePrecision(2);
	return (
		<React.Fragment>
			<h5 className="mb-2 font-normal">My Progress</h5>
			<div className="w-full mb-4.5">
				<div className="w-full flex justify-between items-end">
					<p>
						{claimed
							.trim(true)
							.shrink(true)
							.hideDenom(true)
							.toString()}{' '}
						<span className="text-xs">OSMO</span> /{' '}
						{totalClaimable
							.trim(true)
							.shrink(true)
							.hideDenom(true)
							.toString()}{' '}
						<span className="text-xs">OSMO</span>
					</p>
					<h4>{percent.maxDecimals(0).toString()}%</h4>
				</div>
				<div className="w-full relative h-3 rounded-2xl bg-background mt-2.5">
					<div
						style={{
							width: `${percent.maxDecimals(0).toString()}%`,
							background: 'linear-gradient(270deg, #89EAFB 0%, #1377B0 100%)',
						}}
						className="absolute rounded-2xl h-3 left-0 top-0"
					/>
				</div>
			</div>
		</React.Fragment>
	);
});
