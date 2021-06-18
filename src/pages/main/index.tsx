import React, { FunctionComponent } from 'react';
import { TradeClipboard } from './TradeClipboard';
import { Img } from '../../components/common/Img';

export const MainPage: FunctionComponent = () => {
	return (
		<div className="relative w-full h-full grid" style={{ gridTemplateColumns: '2fr 520px 1fr' }}>
			<div />
			<div className="grid w-full h-full z-30" style={{ gridTemplateRows: '2fr 672px 3fr' }}>
				<div />
				<div style={{ maxWidth: '520px' }}>
					<TradeClipboard />
				</div>
				<div />
			</div>
			<div />
			<div className="absolute top-0 left-0 w-full h-full z-0">
				<div className="absolute z-20 w-full h-full left-0 bottom-0">
					<div
						className="absolute"
						style={{
							width: '726px',
							height: '100%',
							background: 'url("/public/assets/backgrounds/osmosis-guy.png")',
							backgroundSize: 'cover',
						}}
					/>
				</div>
				<div
					className="absolute z-0 h-full left-0 top-0 overflow-x-hidden"
					style={{
						width: '62.885%',
						background: 'url("/public/assets/backgrounds/background-1.png")',
						backgroundSize: 'cover',
					}}
				/>
				<div
					className="absolute z-10 h-full top-0 right-0 overflow-x-hidden"
					style={{
						width: '83.387%',
						background: 'url("/public/assets/backgrounds/background-2.png")',
						backgroundSize: 'cover',
					}}
				/>
			</div>
		</div>
	);
};
