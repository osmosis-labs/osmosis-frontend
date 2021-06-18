import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { AssetsOverview } from './AssetsOverview';
import { AssetBalancesList } from './AssetBalancesList';

export const AssetsPage: FunctionComponent = observer(() => {
	return (
		<div className="w-full h-full bg-surface">
			<div className="px-15 bg-background">
				<div className="py-10 max-w-max mx-auto">
					<AssetsOverview title="My Osmosis Assets" />
				</div>
			</div>
			<div className="px-15 py-10">
				<div className="max-w-max mx-auto">
					<AssetBalancesList />
				</div>
			</div>
		</div>
	);
});
