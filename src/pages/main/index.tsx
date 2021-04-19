import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import '../../styles/index.scss';
import '../../styles/globals.scss';

export const MainPage: FunctionComponent = observer(() => {
	const { chainStore, accountStore } = useStore();

	const accountInfo = accountStore.getAccount(chainStore.current.chainId);

	return (
		<div>
			<h1>{accountInfo.bech32Address}</h1>
			<h2>{accountInfo.bech32Address}</h2>
			<h3>{accountInfo.bech32Address}</h3>
			<h4>{accountInfo.bech32Address}</h4>
			<h5>{accountInfo.bech32Address}</h5>
			<h6>{accountInfo.bech32Address}</h6>
		</div>
	);
});
