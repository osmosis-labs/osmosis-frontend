import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { SynthesisList } from './SynthesisList';
import { LBPOverview } from './overview';
import { PromotedLBPPoolIds } from '../../config';

export const BootstrapPage: FunctionComponent = observer(() => {
	return (
		<div className="w-full h-full">
			<div className="py-10 w-full px-10">
				<div className="max-w-max mx-auto">
					<LBPOverview title="Liquidity Bootstrapping Pools" poolIds={PromotedLBPPoolIds.map(p => p.poolId)} />
				</div>
			</div>
			<div className="py-5 bg-surface w-full px-10">
				<div className="max-w-max mx-auto">
					<SynthesisList />
				</div>
			</div>
		</div>
	);
});
