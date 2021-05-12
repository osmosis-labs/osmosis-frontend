import React, { FunctionComponent } from 'react';
import { TradeClipboard } from './TradeClipboard';

export const MainPage: FunctionComponent = () => {
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
};
