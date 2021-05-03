import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';

export const GovernancePage: FunctionComponent = observer(() => {
	// TODO : load data where data is needed, not here - move to relevant parts of the app
	const { chainStore, accountStore } = useStore();

	const accountInfo = accountStore.getAccount(chainStore.current.chainId);

	return (
		<div className="w-screen h-full flex justify-center items-center">
			<h1>Coming Soon</h1>
		</div>
	);
});
