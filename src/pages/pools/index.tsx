import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import '../../styles/index.scss';
import '../../styles/globals.scss';
import { LabsOverview } from './LabsOverview';
import { IncentivizedPools } from './IncentivizedPools';
import { AllPools } from './AllPools';

export const PoolsPage: FunctionComponent = observer(() => {
	// TODO : load data where data is needed, not here - move to relevant parts of the app
	const { chainStore, accountStore } = useStore();
	accountStore.getAccount(chainStore.current.chainId);
	return (
		<div className="w-full h-full">
			<div className="my-10">
				<LabsOverview />
			</div>
			<div className="py-10 bg-surface w-full pl-10 pr-20">
				<IncentivizedPools />
				<div className="mt-15">
					<AllPools />
				</div>
			</div>
		</div>
	);
});
