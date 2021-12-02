import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { SynthesisList } from './SynthesisList';
import { LBPOverview } from './overview';
import { PromotedLBPPoolIds } from '../../config';

export const BootstrapPage: FunctionComponent = observer(() => {
	return (
		<div className="w-full h-full">
			<div className="pt-21 px-5 pb-5 md:p-10">
				<div className="max-w-page mx-auto">
					<LBPOverview title="Liquidity Bootstrapping Pools" poolIds={PromotedLBPPoolIds.map(p => p.poolId)} />
				</div>
			</div>
			<div className="bg-surface p-5 md:p-10">
				<div className="max-w-page mx-auto">
					<SynthesisList />
				</div>
			</div>
		</div>
	);
});
