import React, { FunctionComponent } from 'react';
import { Img } from '../../components/common/Img';
import { TransferDialog } from '../../dialogs/Transfer';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { IBCAssetInfos } from '../../config';
import { AppCurrency, Currency, IBCCurrency } from '@keplr-wallet/types';
import { makeIBCMinimalDenom } from '../../utils/ibc';
import cn from 'clsx';
import { isProdRuntime, isStagingRuntime } from '../../utils/runtime/checkers';

const tableWidths = ['50%', '25%', '12.5%', '12.5%'];
export const AssetBalancesList: FunctionComponent = observer(() => {
	const { chainStore, queriesStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const ibcBalances = IBCAssetInfos.map(channelInfo => {
		const chainInfo = chainStore.getChain(channelInfo.counterpartyChainId);
		const ibcDenom = makeIBCMinimalDenom(channelInfo.sourceChannelId, channelInfo.coinMinimalDenom);

		const originCurrency = chainInfo.currencies.find(
			cur => cur.coinMinimalDenom === channelInfo.coinMinimalDenom
		) as Currency;

		if (!originCurrency) {
			throw new Error(`Unknown currency ${channelInfo.coinMinimalDenom} for ${channelInfo.counterpartyChainId}`);
		}

		const balance = queries.queryBalances.getQueryBech32Address(account.bech32Address).getBalanceFromCurrency({
			...originCurrency,
			coinMinimalDenom: ibcDenom,
			paths: [
				{
					portId: 'transfer',
					channelId: channelInfo.sourceChannelId,
				},
			],
			originChainId: chainInfo.chainId,
			originCurrency,
		});

		return {
			chainInfo: chainInfo,
			balance,
			sourceChannelId: channelInfo.sourceChannelId,
			destChannelId: channelInfo.destChannelId,
		};
	});

	const [dialogState, setDialogState] = React.useState<
		| {
				open: true;
				currency: IBCCurrency;
				counterpartyChainId: string;
				sourceChannelId: string;
				destChannelId: string;
				isWithdraw: boolean;
		  }
		| {
				open: false;
		  }
	>({ open: false });

	const close = () => setDialogState(v => ({ ...v, open: false }));
	return (
		<React.Fragment>
			{dialogState.open ? (
				<TransferDialog
					dialogStyle={{ minHeight: '533px', maxHeight: '540px', minWidth: '656px', maxWidth: '656px' }}
					isOpen={dialogState.open}
					close={close}
					currency={dialogState.currency}
					counterpartyChainId={dialogState.counterpartyChainId}
					sourceChannelId={dialogState.sourceChannelId}
					destChannelId={dialogState.destChannelId}
					isWithdraw={dialogState.isWithdraw}
				/>
			) : null}
			<table className="w-full">
				<AssetBalanceTableHeader />
				<tbody className="w-full">
					{chainStore.current.currencies
						.filter(cur => !cur.coinMinimalDenom.includes('/'))
						.map(cur => {
							const bal = queries.queryBalances
								.getQueryBech32Address(account.bech32Address)
								.getBalanceFromCurrency(cur);

							return (
								<AssetBalanceRow
									key={cur.coinMinimalDenom}
									chainName=""
									coinDenom={cur.coinDenom}
									currency={cur}
									balance={bal
										.hideDenom(true)
										.trim(true)
										.maxDecimals(6)
										.toString()}
								/>
							);
						})}
					{ibcBalances.map(bal => {
						const currency = bal.balance.currency;
						const coinDenom = (() => {
							if ('originCurrency' in currency && currency.originCurrency) {
								return currency.originCurrency.coinDenom;
							}

							return currency.coinDenom;
						})();

						if (bal.chainInfo.chainId.startsWith('regen-') && (isProdRuntime() || isStagingRuntime())) {
							// Channel of Regen network would not be public yet.
							// By the hard coding, just do not show the deposit/withdraw button for the regen network.
							return (
								<AssetBalanceRow
									key={currency.coinMinimalDenom}
									chainName={bal.chainInfo.chainName}
									coinDenom={coinDenom}
									currency={currency}
									balance={bal.balance
										.hideDenom(true)
										.trim(true)
										.maxDecimals(6)
										.toString()}
									showCommingSoon={true}
								/>
							);
						}

						return (
							<AssetBalanceRow
								key={currency.coinMinimalDenom}
								chainName={bal.chainInfo.chainName}
								coinDenom={coinDenom}
								currency={currency}
								balance={bal.balance
									.hideDenom(true)
									.trim(true)
									.maxDecimals(6)
									.toString()}
								onDeposit={() => {
									setDialogState({
										open: true,
										counterpartyChainId: bal.chainInfo.chainId,
										currency: currency as IBCCurrency,
										sourceChannelId: bal.sourceChannelId,
										destChannelId: bal.destChannelId,
										isWithdraw: false,
									});
								}}
								onWithdraw={() => {
									setDialogState({
										open: true,
										counterpartyChainId: bal.chainInfo.chainId,
										currency: currency as IBCCurrency,
										sourceChannelId: bal.sourceChannelId,
										destChannelId: bal.destChannelId,
										isWithdraw: true,
									});
								}}
							/>
						);
					})}
				</tbody>
			</table>
		</React.Fragment>
	);
});

const AssetBalanceRow: FunctionComponent<{
	chainName: string;
	coinDenom: string;
	currency: AppCurrency;
	balance: string;
	onDeposit?: () => void;
	onWithdraw?: () => void;
	showCommingSoon?: boolean;
}> = ({ chainName, coinDenom, currency, balance, onDeposit, onWithdraw, showCommingSoon }) => {
	let i = 0;
	return (
		<tr style={{ height: '4.5rem' }} className="flex items-center w-full border-b pl-12.5 pr-15">
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<Img loadingSpin className="w-10 h-10" src={currency.coinImageUrl} />
				<p className="ml-5">{chainName ? `${chainName} - ${coinDenom.toUpperCase()}` : coinDenom.toUpperCase()}</p>
			</td>
			<td className="flex items-center justify-end pl-2 pr-20 py-4" style={{ width: tableWidths[i++] }}>
				<p>{balance}</p>
			</td>
			<td
				className={cn('flex items-center px-2 py-3', {
					relative: showCommingSoon,
				})}
				style={{ width: tableWidths[i++] }}>
				{!showCommingSoon && onDeposit ? (
					<button onClick={onDeposit} className="flex items-center cursor-pointer hover:opacity-75">
						<p className="text-sm text-secondary-200">Deposit</p>
						<Img src={'/public/assets/Icons/Right.svg'} />
					</button>
				) : null}
				{showCommingSoon ? (
					<div
						className="absolute text-secondary-200 pl-2"
						style={{
							width: '200px',
						}}>
						🌲 LBP is live 🌲
					</div>
				) : null}
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				{!showCommingSoon && onWithdraw ? (
					<button onClick={onWithdraw} className="flex items-center cursor-pointer hover:opacity-75">
						<p className="text-sm text-secondary-200">Withdraw</p>
						<Img src={'/public/assets/Icons/Right.svg'} />
					</button>
				) : null}
			</td>
		</tr>
	);
};

const AssetBalanceTableHeader: FunctionComponent = () => {
	let i = 0;
	return (
		<thead>
			<tr className="flex items-center w-full border-b pl-12.5 pr-15 bg-card rounded-t-2xl w-full text-white-mid">
				<td className="flex items-center px-2 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">Asset / Chain</p>
				</td>
				<td className="flex items-center justify-end pl-2 pr-20 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">Balance</p>
				</td>
				<td className="flex items-center px-2 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">IBC Deposit</p>
				</td>
				<td className="flex items-center px-2 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">IBC Withdraw</p>
				</td>
			</tr>
		</thead>
	);
};
