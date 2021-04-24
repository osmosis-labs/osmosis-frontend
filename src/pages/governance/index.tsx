import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import '../../styles/index.scss';
import '../../styles/globals.scss';

export const GovernancePage: FunctionComponent = observer(() => {
	// TODO : load data where data is needed, not here - move to relevant parts of the app
	const { chainStore, accountStore } = useStore();

	const accountInfo = accountStore.getAccount(chainStore.current.chainId);

	return <>Governance page</>;
});
