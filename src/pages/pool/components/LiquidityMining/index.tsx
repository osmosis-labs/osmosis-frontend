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
import useWindowSize from 'src/hooks/useWindowSize';
import { useStore } from 'src/stores';
import { ExtraGauge } from './ExtraGauge';
import { MyBondingsTable } from './MyBondingsTable';
import { MyUnBondingTable } from './MyUnbondingTable';

interface Props {
	poolId: string;
}

export const LiquidityMining = observer(function LiquidityMining({ poolId }: Props) {
	const { chainStore, queriesStore, accountStore, priceStore } = useStore();

	const { isMobileView } = useWindowSize();

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
		<>
			<LiquidityMiningContainer>
				<LockLpTokenDialog isOpen={isDialogOpen} close={closeDialog} poolId={poolId} />
				<LiquidityMiningSummary>
					<div>
						<TitleText isMobileView={isMobileView} weight="semiBold">
							Liquidity Mining
						</TitleText>
						<Text isMobileView={isMobileView}>
							Bond liquidity to various minimum unbonding period to earn
							{!isMobileView && <br />}
							OSMO liquidity reward and swap fees
						</Text>
					</div>
					<AvailableLpColumn>
						<Text isMobileView={isMobileView} pb={12}>
							Available LP tokens
						</Text>
						<Text isMobileView={isMobileView} pb={16} size="xl" emphasis="high" weight="semiBold">
							{/* TODO: 풀의 TVL을 계산할 수 없는 경우 그냥 코인 그대로 보여줘야할듯... */}
							{!totalPoolShare.toDec().equals(new Dec(0))
								? poolTotalValueLocked.mul(myPoolShare.quo(totalPoolShare)).toString()
								: '$0'}
						</Text>
						<div>
							<ButtonPrimary
								onClick={() => {
									setIsDialogOpen(true);
								}}>
								<Text isMobileView={isMobileView} emphasis="high">
									Start Earning
								</Text>
							</ButtonPrimary>
						</div>
					</AvailableLpColumn>
				</LiquidityMiningSummary>
				{(() => {
					let gauge = ExtraGaugeInPool[poolId];
					if (gauge) {
						if (!Array.isArray(gauge)) {
							gauge = [gauge];
						}

						return (
							<div
								style={{
									display: 'flex',
									gap: '36px',
								}}>
								{gauge.map(gauge => {
									const currency = chainStore.currentFluent.findCurrency(gauge.denom);
									if (currency) {
										return (
											<ExtraGauge
												gaugeId={gauge.gaugeId}
												currency={currency}
												extraRewardAmount={gauge.extraRewardAmount}
											/>
										);
									}
								})}
							</div>
						);
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
								isMobileView={isMobileView}
							/>
						);
					})}
				</LockDurationSection>
			</LiquidityMiningContainer>
			<TableSection>
				<MyBondingsTable poolId={poolId} />
			</TableSection>
			<TableSection>
				<MyUnBondingTable poolId={poolId} />
			</TableSection>
		</>
	);
});

const LockupBox: FunctionComponent<{
	duration: string;
	apy: string;
	isMobileView: boolean;
}> = ({ duration, apy, isMobileView }) => {
	return (
		<WellContainer>
			<TitleText isMobileView={isMobileView} weight="medium">
				{duration} unbonding
			</TitleText>
			<Text isMobileView={isMobileView} color="gold" size="lg">
				APR {apy}
			</Text>
		</WellContainer>
	);
};

const LiquidityMiningContainer = styled(CenterSelf)`
	padding: 20px 20px 28px;

	@media (min-width: 768px) {
		padding: 40px 0;
	}
`;

const LiquidityMiningSummary = styled.div`
	display: flex;
	flex-direction: column;
	gap: 32px;

	@media (min-width: 768px) {
		flex-direction: row;
		justify-content: space-between;
		gap: 0;
	}
`;

const AvailableLpColumn = styled.div`
	display: flex;
	flex-direction: column;
	align-item: flex-start;

	@media (min-width: 768px) {
		align-items: flex-end;
	}
`;

const LockDurationSection = styled.div`
	margin-top: 40px;
	display: flex;
	flex-wrap: wrap;
	gap: 16px;

	@media (min-width: 768px) {
		flex-wrap: nowrap;
		gap: 36px;
	}
`;

const TableSection = styled.div`
	padding-bottom: 20px;
`;
