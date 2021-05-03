import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { LabsOverview } from './LabsOverview';
import { IncentivizedPools, MyPools } from './IncentivizedPools';
import { AllPools } from './AllPools';
import { TModal } from '../../interfaces';

export const PoolsPage: FunctionComponent = observer(() => {
	const { layoutStore } = useStore();
	return (
		<div
			className={cn(layoutStore.currentModal !== TModal.INIT ? 'w-screen h-screen overflow-hidden' : 'w-full h-full')}>
			<div className="my-10 max-w-max mx-auto">
				<div className="mx-15">
					<LabsOverview />
				</div>
			</div>
			<div className="py-10 bg-surface w-full pl-10 pr-20">
				<div className="max-w-max mx-auto">
					<MyPools />
					<div className="mt-15">
						<IncentivizedPools />
					</div>
					<div className="mt-15">
						<AllPools />
					</div>
				</div>
			</div>
		</div>
	);
});
