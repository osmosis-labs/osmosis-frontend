import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { AssetsOverview } from './AssetsOverview';
import { AssetBalancesList } from './AssetBalancesList';
import { IBCTransferHistoryTable } from './ibc-transfer-history';

export const AssetsPage: FunctionComponent = observer(() => {
	return (
		<div
			className="w-full bg-surface"
			style={{
				height: 'fit-content',
			}}>
			<div className="px-15 bg-background">
				<div className="py-10 max-w-max mx-auto">
					<AssetsOverview title="My Osmosis Assets" />
				</div>
			</div>
			<div className="px-15 py-10">
				<div className="max-w-max mx-auto">
					<div className="mb-8">
						<IBCTransferHistoryTable />
					</div>
					<div className="w-full rounded-xl bg-card py-8 mb-8 flex flex-col items-center">
						<h6 className="mb-5 font-normal">IBC Deposits can take time to show up</h6>
						<p className="text-white-mid font-medium">
							Please wait up to 10 minutes, then refresh the page on your assets page.
						</p>
					</div>
					<AssetBalancesList />
				</div>
			</div>
		</div>
	);
});
