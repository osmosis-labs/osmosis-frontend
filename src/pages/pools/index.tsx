import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import '../../styles/index.scss';
import '../../styles/globals.scss';
import { LabsOverview } from './LabsOverview';

export const PoolsPage: FunctionComponent = observer(() => {
	// TODO : load data where data is needed, not here - move to relevant parts of the app
	const { chainStore, accountStore } = useStore();
	accountStore.getAccount(chainStore.current.chainId);
	return (
		<div className="w-full h-full">
			<LabsOverview />
		</div>
	);
});
