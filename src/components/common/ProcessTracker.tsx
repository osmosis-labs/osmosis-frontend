import { AppCurrency } from '@keplr-wallet/types';
import { Dec, IntPretty } from '@keplr-wallet/unit';
import get from 'lodash/get';
import last from 'lodash/last';
import { observer } from 'mobx-react-lite';
import React, { HTMLAttributes } from 'react';
import { Text } from 'src/components/Texts';
import { colorError } from 'src/emotionStyles/colors';
import { Process, Step } from 'src/hooks/process';
import useWindowSize from 'src/hooks/useWindowSize';
import capitalize from 'lodash/capitalize';

interface BaseConfig {
	spotPriceWithoutSwapFee: IntPretty;
	sendCurrency: AppCurrency;
	outCurrency: AppCurrency;
	estimatedSlippage: IntPretty;
}

interface PoolSwapConfig extends BaseConfig {
	swapFee: IntPretty;
}

interface TradeSwapConfig extends BaseConfig {
	swapFees: IntPretty[];
	showWarningOfSlippage: boolean;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
	config: PoolSwapConfig | TradeSwapConfig;
}

export const ProcessTracker: React.FunctionComponent<{ process: Process; className?: string }> = ({
	process,
	className,
	...props
}) => {
	const icon = (step: Step) => {
		if (step.status === 'prompt') {
			return <div className="flex flex-row items-center">confirm{/* <SpeakerNotesOutlined /> */}</div>;
		}
		if (step.status === 'wait') {
			return <div className="flex flex-row items-center">in progress{/* <HourglassEmpty /> */}</div>;
		}
		if (step.status === 'success') return '✓';
		if (step.status === 'error') {
			// if (isCancelled(step)) {
			// 	return <Cancel />;
			// }
			return 'error'; //<WarningOutlined />;
		}
		return '?'; //<Help />;
	};

	if (!process.steps.length) return null;
	return (
		<div className={`${className ?? ''} w-full flex flex-col items-center`} {...props}>
			{/* {last(process.steps)!.info ? <p>{last(process.steps)!.info}</p> : null} */}
			<ul className={`w-full max-w-sm flex flex-col justify-stretch`}>
				{process.steps.map((step: Step) => {
					const finished = step.status === 'success' || step.status.endsWith('error');

					let classes = 'flex items-center justify-between mb-2 flex-wrap';
					classes += !finished
						? ' animate-pulse duration-500'
						: step.status.endsWith('error')
						? isCancelled(step)
							? ' text-yellow-500'
							: ' text-red-500'
						: ' text-green-500';

					let tooltip;
					if (step.error) tooltip = formatError(step.error);
					if (isCancelled(step)) tooltip = 'Cancelled';
					// if (tooltip) classes += ' cursor-help' - doesn't look nice :/

					/* <Tooltip
							key={`${step.type}|${step.status}|${step.hash ?? 'no-trx'}`}
							title={tooltip ?? '' /* will not show for empty string * /}> */
					return (
						<li className={classes} key={`${step.type}|${step.status}|${step.hash ?? 'no-trx'}`}>
							<span className="mr-6 whitespace-pre leading-tight">{step.info}</span>
							<div className="flex flex-row items-center">
								{step.hash ? (
									<a
										className="text-sm text-white px-1 rounded-sm no-underline"
										style={{ borderWidth: '1px' }}
										href={step.hash}>
										TRX
									</a>
								) : null}
								<strong>{icon(step)}</strong>
							</div>
						</li>
					);
					/* </Tooltip> */
				})}
			</ul>
		</div>
	);
};

function isCancelled(step: Step) {
	// TODO: make for MetaMask, not keplr
	const msg = step.error instanceof Error ? formatError(step.error) : step.error;
	if (typeof msg === 'string' && msg.includes('User denied')) return true;
	if (typeof msg === 'string' && msg.includes('cancelled')) return true;
	return false;
}
/** Either error.message or JSON representation */
export function formatError(error: Error | unknown) {
	let msgOrString = get(error, 'message', JSON.stringify(error, null, 2));
	if (msgOrString !== null && typeof msgOrString !== 'string') msgOrString = JSON.stringify(msgOrString, null, 2); // sometimes, error.message is not a string........
	return msgOrString;
}
