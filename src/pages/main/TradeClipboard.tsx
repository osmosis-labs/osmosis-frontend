import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { FunctionComponent } from 'react';
import { Img } from '../../components/common/Img';
import { Container } from '../../components/containers';
import { useFakeFeeConfig } from '../../hooks/tx';
import { TCardTypes } from '../../interfaces';
import { useStore } from '../../stores';
import { FeesBox } from './components/FeeBox';
import { FromBox } from './components/FormBox';
import { SwapButton } from './components/SwapButton';
import { ToBox } from './components/ToBox';
import { useTradeConfig } from './hooks/useTradeConfig';
import { TradeTxSettings } from './TradeTxSettings';

export const TradeClipboard: FunctionComponent = observer(() => {
	const { chainStore, queriesStore, accountStore, swapManager } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const config = useTradeConfig(
		chainStore,
		chainStore.current.chainId,
		account.bech32Address,
		queries.queryBalances,
		swapManager,
		queries.osmosis.queryGammPools
	);
	const feeConfig = useFakeFeeConfig(chainStore, chainStore.current.chainId, account.msgOpts.swapExactAmountIn.gas);
	config.setFeeConfig(feeConfig);

	return (
		<Container
			overlayClasses=""
			type={TCardTypes.CARD}
			className="w-full h-full shadow-elevation-24dp rounded-2xl relative border-2 border-cardInner">
			<ClipboardClip />
			<div className="p-2.5 h-full w-full">
				<div className="bg-cardInner rounded-md w-full h-full p-5">
					<TradeTxSettings config={config} />
					<section className="mt-5 w-full mb-12.5">
						<div className="relative">
							<div className="mb-4.5">
								<FromBox config={config} />
							</div>
							<div className="mb-4.5">
								<ToBox config={config} />
							</div>
							<button
								className="s-position-abs-center w-12 h-12 z-0"
								onClick={e => {
									e.preventDefault();

									config.switchInAndOut();
								}}>
								<Img className="w-12 h-12" src="/public/assets/sidebar/icon-border_unselected.svg" />
								<Img className="s-position-abs-center w-6 h-6" src="/public/assets/Icons/Switch.svg" />
							</button>
						</div>
						<FeesBox config={config} />
					</section>
					<section className="w-full">
						<SwapButton config={config} />
					</section>
				</div>
			</div>
		</Container>
	);
});

const ClipboardClip: FunctionComponent = () => (
	<div
		style={{
			height: '60px',
			width: '160px',
			left: '50%',
			top: '-8px',
			background: 'linear-gradient(180deg, #3A3369 0%, #231D4B 100%)',
			transform: 'translate(-50%, 0)',
			boxShadow: '0px 2px 2px rgba(11, 16, 38, 0.48)',
		}}
		className="absolute rounded-md overflow-hidden">
		<div
			style={{
				height: '30px',
				width: '48px',
				left: '50%',
				bottom: '7px',
				transform: 'translate(-50%, 0)',
				background: 'rgba(91, 83, 147, 0.12)',
				backgroundBlendMode: 'difference',
			}}
			className="absolute rounded-lg z-10 ">
			<div
				style={{
					height: '30px',
					width: '48px',
					boxShadow: 'inset 1px 1px 1px rgba(0, 0, 0, 0.25)',
				}}
				className="aboslute rounded-md s-position-abs-center"
			/>
		</div>
		<div
			style={{
				height: '20px',
				left: '50%',
				bottom: '0px',
				transform: 'translate(-50%, 0)',
				background: 'linear-gradient(180deg, #332C61 0%, #312A5D 10.94%, #2D2755 100%)',
			}}
			className="z-0 absolute rounded-br-md rounded-bl-md w-full"
		/>
	</div>
);
