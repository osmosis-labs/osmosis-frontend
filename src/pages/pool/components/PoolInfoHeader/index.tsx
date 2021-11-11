import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { ButtonPrimary } from 'src/components/layouts/Buttons';
import { CenterV } from 'src/components/layouts/Containers';
import { Text } from 'src/components/Texts';
import { HideAddLiquidityPoolIds } from 'src/config';
import { ManageLiquidityDialog } from 'src/dialogs';
import { OverviewLabelValueGridList } from 'src/pages/pool/components/PoolInfoHeader/OverviewLabelValueGridList';
import { PoolSwapDialog } from 'src/pages/pool/components/PoolInfoHeader/PoolSwapDialog';
import { colorPrimary } from 'src/emotionStyles/colors';
import styled from '@emotion/styled';
import useWindowSize from 'src/hooks/useWindowSize';
import { useStore } from 'src/stores';

interface Props {
	poolId: string;
}

export const PoolInfoHeader = observer(function PoolInfoHeader({ poolId }: Props) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
	const { isMobileView } = useWindowSize();
	const { chainStore, queriesStore } = useStore();
	const queries = queriesStore.get(chainStore.current.chainId);
	const pool = queries.osmosis.queryGammPools.getPool(poolId);

	const composition = pool?.poolRatios.reduce((str, poolRatio, i, poolRatios) => {
		if (i === 0 || i === poolRatios.length) {
			return `${str} ${poolRatio.amount.currency.coinDenom}`;
		} else {
			return `${str} / ${poolRatio.amount.currency.coinDenom}`;
		}
	}, ': ');

	return (
		<section>
			<ManageLiquidityDialog
				dialogStyle={!isMobileView ? { width: '656px', minHeight: '533px' } : {}}
				poolId={poolId}
				isOpen={isDialogOpen}
				close={() => setIsDialogOpen(false)}
			/>
			<PoolSwapDialog
				dialogStyle={isMobileView ? { backgroundColor: colorPrimary } : { width: '656px', minHeight: '533px' }}
				poolId={poolId}
				isOpen={isSwapDialogOpen}
				close={() => setIsSwapDialogOpen(false)}
			/>

			<PoolHeader>
				<div className="mb-2.5 md:mb-0 md:mr-6">
					<h5>
						Pool #{poolId} {composition}
					</h5>
				</div>
				<div className="flex mb-2.5 md:mb-0">
					{!HideAddLiquidityPoolIds[poolId] && (
						<div className="mr-1.5 md:mr-0 md:ml-6">
							<ButtonPrimary
								type="button"
								onClick={() => {
									setIsDialogOpen(true);
								}}>
								<Text emphasis="high" isMobileView={isMobileView}>
									Add / Remove Liquidity
								</Text>
							</ButtonPrimary>
						</div>
					)}
					<div className="md:ml-6">
						<ButtonPrimary
							type="button"
							onClick={() => {
								setIsSwapDialogOpen(true);
							}}>
							<Text emphasis="high" isMobileView={isMobileView}>
								Swap Tokens
							</Text>
						</ButtonPrimary>
					</div>
				</div>
			</PoolHeader>

			<OverviewLabelValueGridList poolId={poolId} />
		</section>
	);
});

const PoolHeader = styled(CenterV)`
	flex-direction: column;
	align-items: flex-start;
	margin-bottom: 10px;

	@media (min-width: 768px) {
		flex-direction: row;
		align-items: center;
		margin-bottom: 24px;
	}
`;
