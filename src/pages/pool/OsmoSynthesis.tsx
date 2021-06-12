import React, { FunctionComponent, useState } from 'react';
import { multiply } from '../../utils/Big';
import { formatNumber } from '../../utils/format';
import { MyLockupsTable } from './MyLockupsTable';
import { UnlockingTable } from './Unlocking';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { Dec, IntPretty } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { LockLpTokenDialog } from '../../dialogs';

export const OsmoSynthesis: FunctionComponent<{
	poolId: string;
}> = observer(({ poolId }) => {
	const { chainStore, queriesStore, accountStore, priceStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const poolTotalValueLocked =
		queries.osmosis.queryGammPools
			.getPool(poolId)
			?.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!) ??
		new PricePretty(priceStore.getFiatCurrency('usd')!, new Dec(0));
	const totalPoolShare = queries.osmosis.queryGammPools.getPool(poolId)?.totalShare ?? new IntPretty(new Dec(0));
	const myPoolShare = queries.osmosis.queryGammPoolShare.getAvailableGammShare(account.bech32Address, poolId);
	const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const closeDialog = () => setIsDialogOpen(false);

	return (
		<section className="max-w-max mx-auto">
			<LockLpTokenDialog isOpen={isDialogOpen} close={closeDialog} poolId={poolId} />
			<div className="flex justify-between items-start">
				<div>
					<h5 className="mb-3">OSMO Synthesis</h5>
					<p className="text-white-mid">
						Commit to locking your LP tokens for a certain period of time to
						<br />
						earn OSMO tokens and participate in Pool governance
					</p>
				</div>
				<div className="flex flex-col items-end">
					<p className="text-white-mid mb-3">Available LP tokens</p>
					<h5 className="text-right mb-4">
						{/* TODO: 풀의 TVL을 계산할 수 없는 경우 그냥 코인 그대로 보여줘야할듯... */}
						{!totalPoolShare.toDec().equals(new Dec(0))
							? poolTotalValueLocked.mul(myPoolShare.quo(totalPoolShare)).toString()
							: '$0'}
					</h5>
					<button
						onClick={() => {
							setIsDialogOpen(true);
						}}
						className="px-8 py-2.5 bg-primary-200 rounded-lg leading-none hover:opacity-75">
						<p>Start Earning</p>
					</button>
				</div>
			</div>
			<div className="mt-10 grid grid-cols-3 gap-9">
				{lockableDurations.map((lockableDuration, i) => {
					return (
						<LockupBox
							key={i.toString()}
							apy={`${queries.osmosis.queryIncentivizedPools
								.computeAPY(poolId, lockableDuration, priceStore, priceStore.getFiatCurrency('usd')!)
								.toString()}%`}
							duration={lockableDuration.humanize()}
						/>
					);
				})}
			</div>
			<div className="mt-10">
				<MyLockupsTable poolId={poolId} />
			</div>
			<div className="mt-10">
				<UnlockingTable poolId={poolId} />
			</div>
		</section>
	);
});

const LockupBox: FunctionComponent<{
	duration: string;
	apy: string;
}> = ({ duration, apy }) => {
	return (
		<div className="bg-card rounded-2xl pt-7 px-7.5 pb-10">
			<h4 className="mb-4 font-normal text-xl xl:text-2xl">{duration} lockup</h4>
			<h6 className="text-secondary-200 font-normal">APY {apy}</h6>
		</div>
	);
};
