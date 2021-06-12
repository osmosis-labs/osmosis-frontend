import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { DisplayIcon } from '../../components/layouts/Sidebar/SidebarItem';
import { SlippageStep, slippageStepToPercentage, TradeConfig } from './TradeClipboard';
import { observer } from 'mobx-react-lite';

export const TradeTxSettings: FunctionComponent<{
	config: TradeConfig;
}> = observer(({ config }) => {
	const [view, setView] = React.useState<boolean>(false);

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
				className={cn(
					'right-0 top-0 bg-card border border-white-faint rounded-2xl p-7.5',
					view ? 'absolute' : 'hidden'
				)}
				style={{ marginTop: '65px', width: '382px', height: '160px' }}>
				<p className="mb-2.5">Transaction Settings</p>
				<div className="mb-3 w-full flex items-center">
					<p className="text-white-disabled text-sm mr-2.5">Slippage tolerance</p>
					<div className="inline-block rounded-full w-3.5 h-3.5 text-xs bg-secondary-200 flex items-center justify-center text-black">
						!
					</div>
				</div>
				<ul className="grid grid-cols-4 gap-3">
					{[SlippageStep.Step1, SlippageStep.Step2, SlippageStep.Step3].map((slippageStep, i) => {
						return (
							<SlippageToleranceItem
								key={i.toString()}
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

const SlippageToleranceItem: FunctionComponent<{
	percentage: number;
	selected: boolean;
	setSelected: () => void;
}> = ({ percentage, selected, setSelected }) => {
	return (
		<li
			onClick={setSelected}
			className={cn(
				'w-full flex items-center justify-center h-8',
				selected ? 'bg-primary-200' : 'bg-background cursor-pointer hover:opacity-75'
			)}
			style={{ borderRadius: '20px' }}>
			<p className="text-white-high">{percentage}%</p>
		</li>
	);
};

const SlippageToleranceEditableItem: FunctionComponent<{
	config: TradeConfig;
}> = observer(({ config }) => {
	const selected = config.slippageStep == null;

	const error = (() => {
		if (selected) {
			return config.getErrorOfSlippage();
		}
	})();

	return (
		<li
			className={cn(
				'w-full flex items-center justify-center h-8',
				selected ? (error ? 'bg-error' : 'bg-primary-200') : 'bg-background'
			)}
			style={{ borderRadius: '20px' }}>
			<input
				className={cn('text-center', selected ? 'text-white-high' : 'text-white-low')}
				value={`${config.manualSlippageText}%`}
				onFocus={e => {
					e.preventDefault();

					config.setSlippageStep(undefined);
				}}
				onChange={e => {
					e.preventDefault();

					const text = e.currentTarget.value.replace('%', '');
					config.setSlippage(text);
				}}
			/>
		</li>
	);
});
