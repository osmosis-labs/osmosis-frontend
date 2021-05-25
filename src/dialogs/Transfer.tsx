import React, { FunctionComponent, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { BaseDialog, BaseDialogProps } from './base';
import { Img } from '../components/common/Img';
import { IBCCurrency } from '@keplr-wallet/types';
import { useStore } from '../stores';
import { Bech32Address } from '@keplr-wallet/cosmos';
import { WalletStatus } from '@keplr-wallet/stores';
import { Dec } from '@keplr-wallet/unit';

export const TransferDialog: FunctionComponent<BaseDialogProps & {
	currency: IBCCurrency;
	counterpartyChainId: string;
	sourceChannelId: string;
	destChannelId: string;
	isWithdraw: boolean;
}> = observer(({ isOpen, close, style, currency, counterpartyChainId, sourceChannelId, destChannelId, isWithdraw }) => {
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const counterpartyAccount = accountStore.getAccount(counterpartyChainId);

	const bal = queriesStore
		.get(chainStore.current.chainId)
		.queryBalances.getQueryBech32Address(account.bech32Address)
		.getBalanceFromCurrency(currency);
	const counterpartyBal = queriesStore
		.get(counterpartyChainId)
		.queryBalances.getQueryBech32Address(counterpartyAccount.bech32Address)
		.getBalanceFromCurrency(currency.originCurrency!);

	useEffect(() => {
		if (account.bech32Address && counterpartyAccount.walletStatus === WalletStatus.NotInit) {
			counterpartyAccount.init();
		}
	}, [account.bech32Address, counterpartyAccount.walletStatus]);

	const [input, _setInput] = React.useState('');

	const setInput = (value: string) => {
		if (value === '') {
			value = '0';
		}

		if (value.startsWith('.')) {
			value = '0' + value;
		}

		try {
			const dec = new Dec(value);
			if (dec.lt(new Dec(0))) {
				return;
			}
		} catch {
			return;
		}

		_setInput(value);
	};

	return (
		<BaseDialog style={style} isOpen={isOpen} close={close}>
			<div className="w-full h-full text-white-high">
				<div className="mb-10 flex justify-between items-center w-full">
					<h5>{isWithdraw ? 'Withdraw' : 'Deposit'} IBC Asset</h5>
					<button onClick={close} className="hover:opacity-75 cursor-pointer">
						<Img className="w-8 h-8" src={'/public/assets/Icons/close.svg'} />
					</button>
				</div>
				<h6 className="mb-4">IBC Transfer</h6>
				<section className="flex items-center">
					<div className="flex-1 p-4 border border-white-faint rounded-2xl">
						<p className="text-white-high">From</p>
						<p className="text-white-disabled truncate overflow-ellipsis">
							{pickOne(
								Bech32Address.shortenAddress(account.bech32Address, 25),
								Bech32Address.shortenAddress(counterpartyAccount.bech32Address, 25),
								isWithdraw
							)}
						</p>
					</div>
					<div className="flex justify-center items-center w-10">
						<Img src={'/public/assets/Icons/Arrow-Right.svg'} />
					</div>
					<div className="flex-1 p-4 border border-white-faint rounded-2xl">
						<p className="text-white-high">To</p>
						<p className="text-white-disabled truncate overflow-ellipsis">
							{pickOne(
								Bech32Address.shortenAddress(counterpartyAccount.bech32Address, 25),
								Bech32Address.shortenAddress(account.bech32Address, 25),
								isWithdraw
							)}
						</p>
					</div>
				</section>
				<h6 className="mt-7">Amount To {isWithdraw ? 'Withdraw' : 'Deposit'}</h6>
				<div className="mt-4 w-full p-5 border border-secondary-50 border-opacity-60 rounded-2xl">
					<p className="mb-2">
						Available balance:{' '}
						<span className="text-primary-50">
							{pickOne(
								bal
									.upperCase(true)
									.trim(true)
									.maxDecimals(6)
									.toString(),
								counterpartyBal
									.upperCase(true)
									.trim(true)
									.maxDecimals(6)
									.toString(),
								isWithdraw
							)}
						</span>
					</p>
					<div
						className="py-2 px-2.5 bg-background rounded-lg grid gap-5"
						style={{ gridTemplateColumns: 'calc(100% - 60px) 40px' }}>
						<input
							type="number"
							onChange={e => {
								e.preventDefault();

								setInput(e.currentTarget.value);
							}}
							value={input}
							className="text-xl text-white-emphasis"
						/>
						<button
							onClick={() => setInput(``)}
							className="my-auto h-6 w-10 bg-primary-200 hover:opacity-75 cursor-pointer flex justify-center items-center rounded-md">
							<p className="text-xs text-white-high leading-none">MAX</p>
						</button>
					</div>
				</div>
				<div className="w-full mt-9 flex items-center justify-center">
					<button
						onClick={e => {
							e.preventDefault();

							if (isWithdraw) {
								if (account.isReadyToSendMsgs && counterpartyAccount.bech32Address) {
									account.cosmos.sendIBCTransferMsg(
										{
											portId: 'transfer',
											channelId: sourceChannelId,
											counterpartyChainId,
										},
										input,
										currency,
										counterpartyAccount.bech32Address,
										undefined,
										{
											// TOOD: 이 부분 수정해야할듯...
											gas: '1000000',
											amount: [],
										}
									);
								}
							} else {
								if (counterpartyAccount.isReadyToSendMsgs && account.bech32Address) {
									counterpartyAccount.cosmos.sendIBCTransferMsg(
										{
											portId: 'transfer',
											channelId: destChannelId,
											counterpartyChainId: chainStore.current.chainId,
										},
										input,
										currency.originCurrency!,
										account.bech32Address,
										undefined,
										{
											// TOOD: 이 부분 수정해야할듯...
											gas: '1000000',
											amount: [],
										}
									);
								}
							}
						}}
						className="w-2/3 h-15 bg-primary-200 rounded-2xl flex items-center justify-center hover:opacity-75">
						<h6>{isWithdraw ? 'Withdraw' : 'Deposit'}</h6>
					</button>
				</div>
			</div>
		</BaseDialog>
	);
});

function pickOne<V1, V2>(v1: V1, v2: V2, first: boolean): V1 | V2 {
	return first ? v1 : v2;
}
