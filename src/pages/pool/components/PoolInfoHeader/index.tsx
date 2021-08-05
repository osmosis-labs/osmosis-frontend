import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { ButtonPrimary } from 'src/components/layouts/Buttons';
import { CenterV } from 'src/components/layouts/Containers';
import { HideAddLiquidityPoolIds } from 'src/config';
import { ManageLiquidityDialog } from 'src/dialogs';
import { OverviewLabelValueGridList } from 'src/pages/pool/components/PoolInfoHeader/OverviewLabelValueGridList';
import { PoolSwapDialog } from 'src/pages/pool/PoolSwap';

interface Props {
	poolId: string;
}

export const PoolInfoHeader = observer(function PoolInfoHeader({ poolId }: Props) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);

	return (
		<section>
			<ManageLiquidityDialog
				dialogStyle={{ width: '656px', minHeight: '533px' }}
				poolId={poolId}
				isOpen={isDialogOpen}
				close={() => setIsDialogOpen(false)}
			/>
			<PoolSwapDialog poolId={poolId} isOpen={isSwapDialogOpen} close={() => setIsSwapDialogOpen(false)} />

			<CenterV style={{ marginBottom: 24 }}>
				<h5 style={{ marginRight: 24 }}>Pool #{poolId}</h5>
				{!HideAddLiquidityPoolIds[poolId] && (
					<ButtonPrimary
						type="button"
						style={{ marginLeft: 24 }}
						onClick={() => {
							setIsDialogOpen(true);
						}}>
						<p>Add / Remove Liquidity</p>
					</ButtonPrimary>
				)}
				<ButtonPrimary
					type="button"
					style={{ marginLeft: 24 }}
					onClick={() => {
						setIsSwapDialogOpen(true);
					}}>
					<p>Swap Tokens</p>
				</ButtonPrimary>
			</CenterV>

			<OverviewLabelValueGridList poolId={poolId} />
		</section>
	);
});
