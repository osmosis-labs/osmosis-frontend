import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { CreateNewPoolConfig } from './index';
import { Img } from '../../components/common/Img';
import { TokenListDisplay } from '../../components/common/TokenListDisplay';
import { AppCurrency } from '@keplr-wallet/types';
import { observer } from 'mobx-react-lite';

export const NewPoolStage1: FunctionComponent<{
	config: CreateNewPoolConfig;
	close: () => void;
}> = observer(({ config, close }) => {
	const [selectTokenOpen, setSelectTokenOpen] = React.useState<number>(-1);

	return (
		<React.Fragment>
			<div className="pl-4.5">
				<div className="mb-4.5 flex justify-between items-center w-full">
					<h5 className="">Create New Pool</h5>
					<button onClick={close} className="hover:opacity-75 cursor-pointer">
						<Img className="w-6 h-6" src={'/public/assets/Icons/X.svg'} />
					</button>
				</div>
				<div className="w-full flex items-center">
					<p className="text-sm mr-2.5">Step 1/3 - Set token ratio </p>
					<div className="inline-block rounded-full w-3.5 h-3.5 text-xs bg-secondary-200 flex items-center justify-center text-black">
						!
					</div>
				</div>
			</div>
			<ul
				className="mt-5 flex flex-col gap-3 overflow-y-auto"
				style={{ maxHeight: 'max(50vh, 430px)', minHeight: selectTokenOpen !== -1 ? '430px' : '0px' }}>
				{config.assets.map((asset, i: number) => {
					return (
						<Pool
							selectTokenOpen={selectTokenOpen === i}
							toggleTokenOpen={() =>
								setSelectTokenOpen(v => {
									if (v === -1) return i;
									if (v === i) return -1;
									else return i;
								})
							}
							key={asset.amountConfig.currency.coinMinimalDenom}
							config={config}
							assetAt={i}
						/>
					);
				})}
			</ul>
			{config.assets.length < 8 && config.remainingSelectableCurrencies.length > 0 ? (
				<div
					onClick={e => {
						e.preventDefault();

						const currency = config.remainingSelectableCurrencies[0];
						config.addAsset(currency);
					}}
					className="pt-6 pb-7.5 pl-7 border border-white-faint rounded-2xl mt-2.5 hover:border-enabledGold cursor-pointer">
					<div className="flex items-center">
						<div className="w-9 h-9 bg-primary-200 rounded-full flex justify-center items-center mr-5">
							<Img className="w-7 h-7 s-transition-all" src="/public/assets/Icons/Add.svg" />
						</div>
						<h5 className="text-white-high font-normal">Add new token</h5>
					</div>
				</div>
			) : null}
		</React.Fragment>
	);
});

const Pool: FunctionComponent<{
	selectTokenOpen: boolean;
	toggleTokenOpen: () => void;
	config: CreateNewPoolConfig;
	assetAt: number;
}> = observer(({ config, assetAt, toggleTokenOpen, selectTokenOpen }) => {
	const asset = config.assets[assetAt];

	const ref = React.useRef<HTMLLIElement>(null);

	React.useEffect(() => {
		if (!selectTokenOpen || !ref.current) return;
		ref.current.scrollIntoView({ behavior: 'smooth' });
	}, [selectTokenOpen]);

	return (
		<li ref={ref} className="pt-4.5 pb-4.5 pr-7 pl-4.5 border border-white-faint rounded-2xl relative">
			<div className="flex items-center justify-between">
				<TokenChannelDisplay
					currency={asset.amountConfig.currency}
					openSelector={selectTokenOpen}
					setOpenSelector={toggleTokenOpen}
				/>
				<div className="flex items-center">
					<Img
						onClick={() => {
							config.removeAssetAt(assetAt);
						}}
						className="w-8 h-8 mr-4 hover:opacity-75 cursor-pointer s-filter-white"
						src="/public/assets/Icons/Close.svg"
					/>
					<input
						type="number"
						className="bg-black font-title py-1.5 h-9 rounded-lg mr-2.5 pr-1.5 border border-transparent focus:border-enabledGold text-white placeholder-white-disabled text-right text-lg leading-none"
						onChange={e => {
							config.setAssetPercentageAt(assetAt, e.currentTarget.value);
						}}
						value={asset.percentage}
						style={{ maxWidth: '130px' }}
					/>
					<h5>%</h5>
				</div>
			</div>
			<div
				style={{ top: 'calc(100% - 10px)', left: '-1px', width: 'calc(100% + 2px)' }}
				className={cn(
					'bg-surface rounded-b-2xl z-10 border-b border-r border-l border-white-faint',
					selectTokenOpen ? 'absolute' : 'hidden'
				)}>
				<TokenListDisplay
					currencies={config.remainingSelectableCurrencies}
					close={() => toggleTokenOpen()}
					onSelect={minimalDenom => {
						const currency = config.remainingSelectableCurrencies.find(cur => cur.coinMinimalDenom === minimalDenom);
						if (currency) {
							asset.amountConfig.setCurrency(currency);
						}
					}}
				/>
			</div>
		</li>
	);
});

const TokenChannelDisplay: FunctionComponent<{
	currency: AppCurrency;
	openSelector: boolean;
	setOpenSelector: () => void;
}> = ({ currency, openSelector, setOpenSelector }) => {
	// 만약 IBC Currency일 경우 실제 coinDenom을 무시하고 원래 currency의 coinDenom을 표시한다.
	const coinDenom =
		'originCurrency' in currency && currency.originCurrency ? currency.originCurrency.coinDenom : currency.coinDenom;
	// 만약 IBC Currency일 경우 첫번째 path의 채널 ID를 보여준다.
	const channel = 'paths' in currency && currency.paths.length > 0 ? currency.paths[0].channelId : '';

	return (
		<div className="flex items-center">
			<figure
				style={{ width: '56px', height: '56px' }}
				className="flex justify-center items-center rounded-full border-secondary-200 border mr-3">
				<Img loadingSpin style={{ width: '44px', height: '44px' }} src={currency.coinImageUrl} />
			</figure>
			<div className="flex flex-col">
				<div className="flex items-center">
					<h5 className="leading-none font-semibold">{coinDenom.toUpperCase()}</h5>
					<Img
						onClick={() => setOpenSelector()}
						className={cn(
							'h-6 w-8 ml-1 p-2 cursor-pointer opacity-40 hover:opacity-100',
							openSelector ? 'rotate-180' : ''
						)}
						src="/public/assets/Icons/Down.svg"
					/>
				</div>
				{channel ? <p className="text-sm text-iconDefault mt-1">{channel}</p> : null}
			</div>
		</div>
	);
};
