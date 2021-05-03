import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { AirdropOverview } from './AirdropOverview';
import { MyAirdropProgress } from './MyAirdropProgress';
import { useAirdropData } from './useAirdropData';
import { AirdropMissions } from './AirdropMissions';

export const AirdropPage: FunctionComponent = observer(() => {
	const airdropData = useAirdropData();
	return (
		<div className="w-full h-full">
			<div className="mx-15">
				<div className="my-10 max-w-max mx-auto">
					<AirdropOverview state={airdropData} />
				</div>
			</div>
			<div className="mt-9 px-15 py-12.5 bg-surface">
				<div className="max-w-max mx-auto">
					<MyAirdropProgress state={airdropData} />
					<div className="mt-9">
						<AirdropMissions />
					</div>
				</div>
			</div>
		</div>
	);
});
