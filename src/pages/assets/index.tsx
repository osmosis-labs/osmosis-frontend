import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { AssetsOverview } from './AssetsOverview';
import { AssetBalancesList } from './AssetBalancesList';

export const AssetsPage: FunctionComponent = observer(() => {
	// TODO : @Thunnini retrieve user asset balances
	const assetData = [
		{
			token: 'atom',
			balance: 123456.123456,
		},
		{
			token: 'akt',
			balance: 123456.123456,
		},
		{
			token: 'iris',
			balance: 0,
		},
		{
			token: 'scrt',
			balance: 0,
		},
	] as IAssetBalance[];
	return (
		<div className="w-full h-full bg-surface">
			<div className="px-15 bg-background">
				<div className="py-10 max-w-max mx-auto">
					<AssetsOverview title="My IBC Assets" />
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

export interface IAssetBalance {
	token: string;
	balance: number;
}

export interface IAssets {
	total: number;
	available: number;
	locked: number;
}
