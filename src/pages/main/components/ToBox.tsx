import { IAmountConfig } from '@keplr-wallet/hooks';
import { AppCurrency } from '@keplr-wallet/types';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { TokenDisplay } from '../../../components/common/TokenDisplay';
import { TokenListDisplay } from '../../../components/common/TokenListDisplay';

interface Props {
	config: IAmountConfig & {
		outAmount: CoinPretty;
		outCurrency: AppCurrency;
		setOutCurrency(minimalDenom: string): void;
	};
}

export const ToBox = observer(({ config }: Props) => {
	const [openSelector, setOpenSelector] = React.useState(false);
	return (
		<div className="bg-surface rounded-2xl py-4 pr-5 pl-4 relative">
			<section className="flex justify-between items-center mb-2">
				<p>To</p>
			</section>
			<section className="grid grid-cols-2">
				<TokenDisplay setOpenSelector={setOpenSelector} openSelector={openSelector} currency={config.outCurrency} />
				<div className="text-right flex flex-col justify-center h-full">
					<h5
						className={cn('text-xl font-title font-semibold truncate', {
							'opacity-40': config.outAmount.toDec().equals(new Dec(0)),
						})}>
						{'≈ ' +
							config.outAmount
								.trim(true)
								.maxDecimals(6)
								.shrink(true)
								.toString()}
					</h5>
				</div>
			</section>
			<div
				style={{ top: 'calc(100% - 16px)' }}
				className={cn('bg-surface rounded-b-2xl z-10 left-0 w-full', openSelector ? 'absolute' : 'hidden')}>
				<TokenListDisplay
					currencies={config.sendableCurrencies.filter(
						cur => cur.coinMinimalDenom !== config.sendCurrency.coinMinimalDenom
					)}
					close={() => setOpenSelector(false)}
					onSelect={minimalDenom => config.setOutCurrency(minimalDenom)}
				/>
			</div>
		</div>
	);
});
