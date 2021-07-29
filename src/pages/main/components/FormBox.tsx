import { IAmountConfig } from '@keplr-wallet/hooks';
import { AppCurrency } from '@keplr-wallet/types';
import { CoinPretty, Int } from '@keplr-wallet/unit';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import * as React from 'react';
import { DisplayAmount } from '../../../components/common/DIsplayAmount';
import { TokenDisplay } from '../../../components/common/TokenDisplay';
import { TokenListDisplay } from '../../../components/common/TokenListDisplay';
import { useStore } from '../../../stores';
import { TokenAmountInput } from './TokenAmountInput';

interface Props {
	config: IAmountConfig & {
		outCurrency: AppCurrency;
		setInCurrency(minimalDenom: string): void;
	};
}

export const FromBox = observer(({ config }: Props) => {
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const balance = queries.queryBalances
		.getQueryBech32Address(account.bech32Address)
		.balances.find(bal => bal.currency.coinMinimalDenom === config.sendCurrency.coinMinimalDenom);

	const [isSelectorOpen, setIsSelectorOpen] = useState(false);

	return (
		<div className="bg-surface rounded-2xl py-4 pr-5 pl-4 relative">
			<section className="flex justify-between items-center mb-2">
				<p>From</p>
				<div className="flex items-center">
					<div>
						<p className="inline-block text-sm leading-tight w-fit text-xs mr-2">Available</p>
						<DisplayAmount
							wrapperClass="w-fit text-primary-50"
							amount={balance ? balance.balance : new CoinPretty(config.sendCurrency, new Int('0'))}
						/>
					</div>
					<button
						className={cn('rounded-md py-1 px-1.5 bg-white-faint h-6 ml-1.25', config.isMax && 'bg-primary-200')}
						onClick={e => {
							e.preventDefault();

							config.toggleIsMax();
						}}>
						<p className="text-xs">MAX</p>
					</button>
				</div>
			</section>
			<section className="flex justify-between items-center">
				<TokenDisplay
					openSelector={isSelectorOpen}
					setOpenSelector={setIsSelectorOpen}
					currency={config.sendCurrency}
				/>
				<TokenAmountInput
					amount={config.amount}
					currency={config.sendCurrency}
					onInput={text => config.setAmount(text)}
				/>
			</section>
			<div
				style={{ top: 'calc(100% - 16px)' }}
				className={cn('bg-surface rounded-b-2xl z-10 left-0 w-full', isSelectorOpen ? 'absolute' : 'hidden')}>
				<TokenListDisplay
					currencies={config.sendableCurrencies.filter(
						cur => cur.coinMinimalDenom !== config.outCurrency.coinMinimalDenom
					)}
					close={() => setIsSelectorOpen(false)}
					onSelect={minimalDenom => config.setInCurrency(minimalDenom)}
				/>
			</div>
		</div>
	);
});
