import Tippy from '@tippyjs/react';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useState } from 'react';
import AutosizeInput from 'react-input-autosize';
import { DisplayIcon } from '../../components/layouts/Sidebar/SidebarItem';
import { useBooleanStateWithWindowEvent } from '../../hooks/useBooleanStateWithWindowEvent';
import { SlippageStep } from './models/tradeModels';
import { TradeConfig } from './stores/trade/config';
import { slippageStepToPercentage } from './utils/slippageStepToPercentage';

interface Props {
	config: TradeConfig;
}

export const TradeTxSettings = observer(({ config }: Props) => {
	const [view, setView] = useBooleanStateWithWindowEvent(false);

	return (
		<section className="w-full flex justify-end relative z-40">
			<div onClick={() => setView(v => !v)}>
				<DisplayIcon
					clicked={view}
					className="cursor-pointer"
					icon="/public/assets/Icons/Setting.svg"
					iconSelected="/public/assets/Icons/Setting_selected.svg"
				/>
			</div>
			<div
				onClick={e => e.stopPropagation()}
				className={cn(
					'right-0 top-0 bg-card border border-white-faint rounded-2xl p-7.5',
					view ? 'absolute' : 'hidden'
				)}
				style={{ marginTop: '65px', width: '382px', height: '160px' }}>
				<p className="mb-2.5">Transaction Settings</p>
				<div className="mb-3 w-full flex items-center">
					<p className="text-white-disabled text-sm mr-2.5">Slippage tolerance</p>
					<Tippy
						className="w-75"
						content="Your transaction will revert if the price changes unfavorably by more than this percentage.">
						<div className="inline-block rounded-full w-3.5 h-3.5 text-xs bg-secondary-200 flex items-center justify-center text-black cursor-pointer">
							!
						</div>
					</Tippy>
				</div>
				<ul className="grid grid-cols-4 gap-3">
					{[SlippageStep.Step1, SlippageStep.Step2, SlippageStep.Step3].map(slippageStep => {
						return (
							<SlippageToleranceItem
								key={slippageStep?.toString()}
								percentage={slippageStepToPercentage(slippageStep)}
								setSelected={() => config.setSlippageStep(slippageStep)}
								selected={config.slippageStep === slippageStep}
							/>
						);
					})}
					<SlippageToleranceEditableItem config={config} />
				</ul>
			</div>
		</section>
	);
});

interface ItemProps {
	percentage: number;
	selected: boolean;
	setSelected: () => void;
}

const SlippageToleranceItem = ({ percentage, selected, setSelected }: ItemProps) => {
	return (
		<li
			onClick={setSelected}
			className={cn(
				'w-full flex items-center justify-center h-8 cursor-pointer',
				selected ? 'bg-primary-200' : 'bg-background hover:opacity-75'
			)}
			style={{ borderRadius: '20px' }}>
			<p className="text-white-high">{percentage}%</p>
		</li>
	);
};

const SlippageToleranceEditableItem = observer(({ config }: Props) => {
	const selected = config.slippageStep == null;

	const error = (() => {
		if (selected) {
			return config.getErrorOfSlippage();
		}
	})();

	return (
		<li
			className={cn('w-full flex h-8', selected ? (error ? 'bg-error' : 'bg-primary-200') : 'bg-background')}
			style={{ borderRadius: '20px' }}>
			<label style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
				<AutosizeInput
					className={cn('text-center', selected ? 'text-white-high' : 'text-white-low')}
					minWidth={config.manualSlippageText === config.initialManualSlippage ? 24 : undefined}
					value={config.manualSlippageText}
					onFocus={e => {
						e.preventDefault();
						config.setSlippageStep(undefined);
					}}
					onChange={e => {
						e.preventDefault();
						const text = e.currentTarget.value;
						config.setSlippage(text);
					}}
				/>
				<span>%</span>
			</label>
		</li>
	);
});
