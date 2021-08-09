import styled from '@emotion/styled';
import { Dec, IntPretty } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useState } from 'react';
import { ButtonPrimary } from 'src/components/layouts/Buttons';
import { CenterSelf, WellContainer } from 'src/components/layouts/Containers';
import { TitleText, Text } from 'src/components/Texts';
import { ExtraGaugeInPool } from 'src/config';
import { LockLpTokenDialog } from 'src/dialogs';
import { useStore } from 'src/stores';
import { ExtraGauge } from './ExtraGauge';
import { MyBondingsTable } from './MyBondingsTable';
import { UnlockingTable } from './Unlocking';

interface Props {
	poolId: string;
}

export const LiquidityMining = observer(function LiquidityMining({ poolId }: Props) {
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
		<CenterSelf>
			<LockLpTokenDialog isOpen={isDialogOpen} close={closeDialog} poolId={poolId} />
			<LiquidityMiningSummary>
				<div>
					<TitleText weight="semiBold">Liquidity Mining</TitleText>
					<Text>
						Commit to bonding your LP tokens for a certain period of time to
						<br />
						earn OSMO tokens and participate in Pool governance
					</Text>
				</div>
				<AvailableLpColumn>
					<Text pb={12}>Available LP tokens</Text>
					<Text pb={16} size="xl" emphasis="high" weight="semiBold">
						{/* TODO: 풀의 TVL을 계산할 수 없는 경우 그냥 코인 그대로 보여줘야할듯... */}
						{!totalPoolShare.toDec().equals(new Dec(0))
							? poolTotalValueLocked.mul(myPoolShare.quo(totalPoolShare)).toString()
							: '$0'}
					</Text>
					<ButtonPrimary
						onClick={() => {
							setIsDialogOpen(true);
						}}>
						<Text emphasis="high">Start Earning</Text>
					</ButtonPrimary>
				</AvailableLpColumn>
			</LiquidityMiningSummary>
			{(() => {
				const gauge = ExtraGaugeInPool[poolId];
				if (gauge) {
					const currency = chainStore.currentFluent.findCurrency(gauge.denom);
					if (currency) {
						return (
							<ExtraGauge gaugeId={gauge.gaugeId} currency={currency} extraRewardAmount={gauge.extraRewardAmount} />
						);
					}
				}
				return null;
			})()}
			<LockDurationSection>
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
			</LockDurationSection>
			<TableSection>
				<MyBondingsTable poolId={poolId} />
			</TableSection>
			<TableSection>
				<UnlockingTable poolId={poolId} />
			</TableSection>
		</CenterSelf>
	);
});

const LockupBox: FunctionComponent<{
	duration: string;
	apy: string;
}> = ({ duration, apy }) => {
	return (
		<WellContainer>
			<TitleText>{duration} bonding</TitleText>
			<Text color="secondary" size="lg">
				APR {apy}
			</Text>
		</WellContainer>
	);
};

const LiquidityMiningSummary = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
`;

const AvailableLpColumn = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
`;

const LockDurationSection = styled.div`
	margin-top: 40px;
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 36px;
`;

const TableSection = styled.div`
	margin-top: 40px;
`;
