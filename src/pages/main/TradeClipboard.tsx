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
import { TokenListDisplay } from '../../components/common/TokenListDisplay';
import noop from 'lodash-es/noop';
import { TokenDisplay } from '../../components/common/TokenDisplay';

const defaultState = {
	isMax: false,
	from: {
		token: 'eth',
		amount: '0',
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

	const setToken = React.useCallback((newToken: string, param: 'from' | 'to') => {
		setState(oldState => ({ ...oldState, [param]: { ...oldState[param], token: newToken } }));
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
							<div className="mb-4.5">
								<FromBox setToken={setToken} state={state.from} onInput={onInputFrom} />
							</div>
							<div className="mb-4.5">
								<ToBox setToken={setToken} state={state} conversionRate={conversionRate} />
							</div>
							<div className="s-position-abs-center w-12 h-12 z-0">
								<Img className="w-12 h-12" src="/public/assets/sidebar/icon-border_unselected.svg" />
								<Img className="s-position-abs-center w-6 h-6" src="/public/assets/Icons/Switch.svg" />
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
				<div className="grid grid-cols-5">
					<p className="text-sm text-wireframes-lightGrey">Swap Fee</p>
					<p className="col-span-4 text-sm text-wireframes-lightGrey text-right truncate">
						{multiply(state.from.amount, swapPercent, TOKENS[state.to.token].DECIMALS)} {state.to.token.toUpperCase()}(
						{multiply(swapPercent, 100, 2)}%)
					</p>
				</div>
			</section>
		</Container>
	);
};

const FromBox: FunctionComponent<ITradeFromBox> = ({ state, onInput, setToken }) => {
	const [openSelector, setOpenSelector] = React.useState(false);
	return (
		<div className="bg-surface rounded-2xl py-4 pr-5 pl-4 relative">
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
				<TokenDisplay openSelector={openSelector} setOpenSelector={setOpenSelector} token={state.token} />
				<TokenAmountInput state={state} onInput={onInput} />
			</section>
			<div
				style={{ top: 'calc(100% - 16px)' }}
				className={cn('bg-surface rounded-b-2xl z-10 left-0 w-full', openSelector ? 'absolute' : 'hidden')}>
				<TokenListDisplay close={() => setOpenSelector(false)} onSelect={newToken => setToken(newToken, 'from')} />
			</div>
		</div>
	);
};

const TokenAmountInput: FunctionComponent<ITokenAmountInput> = ({ state, onInput }) => {
	// TODO : @Thunnini integrate proper token price
	const tokenPrice = 12.5;
	return (
		<div style={{ maxWidth: '250px' }} className="flex flex-col items-end">
			<input
				style={{ maxWidth: '250px' }}
				onChange={e => onInput(e.currentTarget.value)}
				value={state.amount}
				placeholder="0"
				className="s-tradebox-input"
			/>
			<p className="font-body font-semibold text-sm truncate w-full text-right">
				≈ ${multiply(state.amount, tokenPrice, 2)}
			</p>
		</div>
	);
};

const ToBox: FunctionComponent<ITradeToBox> = ({ setToken, state, conversionRate }) => {
	const [openSelector, setOpenSelector] = React.useState(false);
	return (
		<div className="bg-surface rounded-2xl py-4 pr-5 pl-4 relative">
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
			<section className="grid grid-cols-2">
				<TokenDisplay setOpenSelector={setOpenSelector} openSelector={openSelector} token={state.to.token} />
				<div className="text-right flex flex-col justify-center h-full">
					<h5
						className={cn('text-xl font-title font-semibold truncate', {
							'opacity-40': state.from.amount === '',
						})}>
						{multiply(state.from.amount, conversionRate, TOKENS[state.to.token]?.DECIMALS)}
					</h5>
				</div>
			</section>
			<div
				style={{ top: 'calc(100% - 16px)' }}
				className={cn('bg-surface rounded-b-2xl z-10 left-0 w-full', openSelector ? 'absolute' : 'hidden')}>
				<TokenListDisplay close={() => setOpenSelector(false)} onSelect={newToken => setToken(newToken, 'to')} />
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

interface ITokenAmountInput {
	state: TTradeSide;
	onInput: (input: string) => void;
}

interface ITradeFromBox {
	setToken: (newToken: string, param: 'from' | 'to') => void;
	state: TTradeSide;
	onInput: (input: string) => void;
}

interface ITradeToBox {
	setToken: (newToken: string, param: 'from' | 'to') => void;
	state: ITradeClipboardState;
	conversionRate: number;
}

interface IFeesBox {
	state: ITradeClipboardState;
	conversionRate: number;
	swapPercent: number;
}
