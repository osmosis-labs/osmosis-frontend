import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { SynthesisList } from './SynthesisList';
import { LBPOverview } from './overview';
import { PromotedLBPPoolIds } from '../../config';

export const BootstrapPage: FunctionComponent = observer(() => {
	return (
		<div className="w-full h-full">
			<div className="pt-21 px-5 pb-5 md:py-10 md:px-15">
				<LBPOverview title="Liquidity Bootstrapping Pools" poolIds={PromotedLBPPoolIds.map(p => p.poolId)} />
			</div>
			<div className="p-5 bg-surface md:py-12.5 md:px-15">
				<div className="max-w-max mx-auto">
					<SynthesisList />
				</div>
			</div>
		</div>
	);
});
