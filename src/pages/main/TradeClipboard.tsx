import * as React from 'react';
import { FunctionComponent } from 'react';
import upperCase from 'lodash-es/upperCase';
import { Container } from '../../components/containers';
import { TCardTypes } from '../../interfaces';
import { DisplayIcon } from '../../components/layouts/Sidebar/SidebarItem';
import { DisplayAmount } from '../../components/common/DIsplayAmount';
import { Img } from '../../components/common/Img';
import { LINKS, TOKENS } from '../../constants';
import { divide, fixed, multiply } from '../../utils/Big';
import { isNumber } from '../../utils/scripts';
import cn from 'clsx';

const defaultState = {
	isMax: false,
	from: {
		token: 'eth',
		amount: '',
	},
	to: {
		token: 'atom',
	},
};

export const TradeClipboard: FunctionComponent = () => {
	// TODO : @Thunnini fetch user's max value
	const max = '3502.350215';

	const [state, setState] = React.useState<ITradeClipboardState>(defaultState);

	// TODO : @Thunnini fetch conversion rates for 'from token' to 'to token'
	const conversionRate = 20.5;

	// TODO : @Thunnini get swap fee
	const swapPercent = 0.0003;

	const onInputFrom = React.useCallback((newAmount: string) => {
		if (!isNumber(newAmount)) return;
		setState(oldState => ({ ...oldState, from: { ...oldState.from, amount: `${newAmount}` } }));
	}, []);
	return (
		<Container
			overlayClasses=""
			type={TCardTypes.CARD}
			className="w-full h-full shadow-elevation-24dp rounded-2xl relative border-2 border-cardInner">
			<ClipboardClip />
			<div className="p-2.5 h-full w-full">
				<div className="bg-cardInner rounded-md w-full h-full p-5">
					<section>
						<DisplayIcon
							className="cursor-pointer ml-auto"
							icon="/public/assets/Icons/Setting.svg"
							iconSelected="/public/assets/Icons/Setting_selected.svg"
						/>
					</section>
					<section className="mt-5 w-full mb-12.5">
						<div className="relative">
							<div className="s-position-abs-center w-12 h-12 z-0">
								<Img className="w-12 h-12" src="/public/assets/sidebar/icon-border_unselected.svg" />
								<Img className="s-position-abs-center w-6 h-6" src="/public/assets/Icons/Switch.svg" />
							</div>
							<div className="mb-4.5">
								<FromBox state={state.from} onInput={onInputFrom} />
							</div>
							<div className="mb-4.5">
								<ToBox state={state} conversionRate={conversionRate} />
							</div>
						</div>
						<FeesBox state={state} conversionRate={conversionRate} swapPercent={swapPercent} />
					</section>
					<section className="w-full">
						<SwapButton state={state} conversionRate={conversionRate} swapPercent={swapPercent} />
					</section>
				</div>
			</div>
		</Container>
	);
};

const SwapButton: FunctionComponent<IFeesBox> = ({ state, swapPercent, conversionRate }) => {
	const onButtonClick = React.useCallback(() => {
		alert('swap button click');
	}, [state, swapPercent, conversionRate]);

	return (
		<button
			onClick={onButtonClick}
			className="bg-primary-200 h-15 flex justify-center items-center w-full rounded-lg shadow-elevation-04dp hover:opacity-75">
			<p className="font-body tracking-wide">SWAP</p>
		</button>
	);
};

const FeesBox: FunctionComponent<IFeesBox> = ({ state, conversionRate, swapPercent }) => {
	return (
		<Container className="rounded-lg py-3 px-4.5 w-full border border-white-faint" type={TCardTypes.CARD}>
			<section className="w-full">
				<div className="flex justify-between items-center">
					<p className="text-sm text-wireframes-lightGrey">Rate</p>
					<p className="text-sm text-wireframes-lightGrey">
						<span className="mr-2">1 {state.from.token.toUpperCase()} =</span> {fixed(conversionRate, 2)}{' '}
						{state.to.token.toUpperCase()}
					</p>
				</div>
				<div className="flex justify-end items-center mt-1.5 mb-2.5">
					<p className="text-xs text-wireframes-grey">
						<span className="mr-2">= 1 {state.to.token.toUpperCase()}</span> {divide(1, conversionRate, 2)}{' '}
						{state.from.token.toUpperCase()}
					</p>
				</div>
				<div className="flex justify-between items-center">
					<p className="text-sm text-wireframes-lightGrey">Swap Fee</p>
					<p className="text-sm text-wireframes-lightGrey">
						{multiply(state.from.amount, swapPercent, TOKENS[state.to.token].DECIMALS)} {state.to.token.toUpperCase()} (
						{multiply(swapPercent, 100, 2)}%)
					</p>
				</div>
			</section>
		</Container>
	);
};

const FromBox: FunctionComponent<ITradeFromBox> = ({ state, onInput }) => {
	// TODO : @Thunnini connect api that retrieves current applicable tokens
	return (
		<div className="bg-surface rounded-2xl py-4 pr-5 pl-4">
			<section className="flex justify-between items-center mb-2">
				<p>From</p>
				<div className="flex items-center">
					<div>
						<p className="inline-block text-sm leading-tight w-fit text-xs mr-2">Available</p>
						<DisplayAmount
							sizeInt={12}
							sizeDecimal={12}
							sizeCurrency={12}
							decimals={6}
							wrapperClass="w-fit text-primary-50"
							amount={3502.350215}
							currency={'ATOM'}
						/>
					</div>
					<button className="rounded-md py-1 px-1.5 bg-white-faint h-6 ml-1.25">
						<p className="text-xs">MAX</p>
					</button>
				</div>
			</section>
			<section className="flex justify-between items-center">
				<TokenDisplay token={state.token} />
				<TokenAmountInput state={state} onInput={onInput} />
			</section>
		</div>
	);
};

const TokenAmountInput: FunctionComponent<ITradeFromBox> = ({ state, onInput }) => {
	// TODO : @Thunnini integrate proper token price
	const tokenPrice = 12.5;
	return (
		<div className="flex flex-col items-end">
			<input
				onChange={e => onInput(e.currentTarget.value)}
				value={state.amount}
				placeholder="0"
				className="s-tradebox-input"
			/>
			<p className="font-body font-semibold text-sm">≈ ${multiply(state.amount, tokenPrice, 2)}</p>
		</div>
	);
};

const ToBox: FunctionComponent<ITradeToBox> = ({ state, conversionRate }) => {
	// TODO : @Thunnini connect api that retrieves current applicable tokens
	return (
		<div className="bg-surface rounded-2xl py-4 pr-5 pl-4">
			<section className="flex justify-between items-center mb-2">
				<p>To</p>
				<div className="flex items-center">
					<div>
						<p className="inline-block text-sm leading-tight w-fit text-xs mr-2">Available</p>
						<DisplayAmount
							sizeInt={12}
							sizeDecimal={12}
							sizeCurrency={12}
							decimals={6}
							wrapperClass="w-fit text-primary-50"
							amount={3502.350215}
							currency={'ATOM'}
						/>
					</div>
					<button className="rounded-md py-1 px-1.5 bg-white-faint h-6 ml-1.25">
						<p className="text-xs">MAX</p>
					</button>
				</div>
			</section>
			<section className="flex justify-between items-center">
				<TokenDisplay token={state.to.token} />
				<div className="flex justify-end items-start">
					<h5 className={cn('text-xl font-title font-semibold', { 'opacity-40': state.from.amount === '' })}>
						{multiply(state.from.amount, conversionRate, TOKENS[state.to.token]?.DECIMALS)}
					</h5>
				</div>
			</section>
		</div>
	);
};

const TokenDisplay: FunctionComponent<Record<'token', string>> = ({ token }) => {
	return (
		<div className="flex items-center">
			<figure
				style={{ width: '56px', height: '56px' }}
				className="flex justify-center items-center rounded-full border-secondary-200 border mr-3">
				<Img loadingSpin style={{ width: '44px', height: '44px' }} src={LINKS.GET_TOKEN_IMG('eth')} />
			</figure>
			<div className="flex flex-col">
				<div className="flex items-center">
					<h5 className="leading-none font-semibold">{upperCase(token)}</h5>
					<Img className="h-6 w-8 ml-1 p-2" src="/public/assets/Icons/Down.svg" />
				</div>
				<p className="text-sm text-iconDefault">{TOKENS[token]?.LONG_NAME}</p>
			</div>
		</div>
	);
};

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

interface TTradeSide {
	token: string;
	amount: string;
}

interface ITradeClipboardState {
	isMax: boolean;
	from: TTradeSide;
	to: Record<'token', string>;
}

interface ITradeFromBox {
	state: TTradeSide;
	onInput: (input: string) => void;
}

interface ITradeToBox {
	state: ITradeClipboardState;
	conversionRate: number;
}

interface IFeesBox {
	state: ITradeClipboardState;
	conversionRate: number;
	swapPercent: number;
}
