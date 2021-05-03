import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { TradeClipboard } from './TradeClipboard';

export const MainPage: FunctionComponent = observer(() => {
	// TODO : load data where data is needed, not here - move to relevant parts of the app
	const { chainStore, accountStore } = useStore();

	const accountInfo = accountStore.getAccount(chainStore.current.chainId);

	return (
		<div className="w-full h-full grid" style={{ gridTemplateColumns: '2fr 520px 1fr' }}>
			<div />
			<div className="grid w-full h-full" style={{ gridTemplateRows: '2fr 648px 3fr' }}>
				<div />
				<div style={{ maxWidth: '520px' }}>
					<TradeClipboard />
				</div>
				<div />
			</div>
			<div />
		</div>
	);
});
