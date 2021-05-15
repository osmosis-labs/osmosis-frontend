import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { BaseDialog, BaseModalProps } from './base';
import { Img } from '../components/common/Img';
import { truncateString } from '../utils/format';
import { isNumber } from '../utils/scripts';
import { gt } from '../utils/Big';

export const TransferDialog: FunctionComponent<BaseModalProps & { token: string; isWithdraw: boolean }> = observer(
	({ isOpen, close, style, token, isWithdraw }) => {
		// TODO : @Thunnini fetch addresses + available
		const targetAddr = 'cosmos1ymk637a7wljvt4w7q9lnrw95mg9sr37y4s4an9';
		const osmoAddr = 'osmo1ymk637a7wljvt4w7q9lnrw95mg9sr37y4s4an9';
		const available = 3502.350215;
		const [input, setInput] = React.useState('');

		const onTransfer = React.useCallback(
			input => {
				if (!input || input === '0') return alert(`Please input an amount to ${isWithdraw ? 'Withdraw' : 'Deposit'}`);
				if (gt(input, available)) return alert('Not enough available balance');
				alert(`Successfully requested ${isWithdraw ? 'Withdraw' : 'Deposit'}`);
				close();
			},
			[available, close]
		);

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
						<div style={{ maxWidth: '260px', minWidth: '260px' }} className="p-4 border border-white-faint rounded-2xl">
							<p className="text-white-high">From</p>
							<p className="text-white-disabled truncate overflow-ellipsis">
								{truncateString(!isWithdraw ? targetAddr : osmoAddr, 9, 5)}
							</p>
						</div>
						<div className="flex justify-center items-center w-10">
							<Img src={'/public/assets/Icons/Arrow-Right.svg'} />
						</div>
						<div style={{ maxWidth: '260px', minWidth: '260px' }} className="p-4 border border-white-faint rounded-2xl">
							<p className="text-white-high">To</p>
							<p className="text-white-disabled truncate overflow-ellipsis">
								{truncateString(isWithdraw ? targetAddr : osmoAddr, 9, 5)}
							</p>
						</div>
					</section>
					<h6 className="mt-7">Amount To {isWithdraw ? 'Withdraw' : 'Deposit'}</h6>
					<div className="mt-4 w-full p-5 border border-secondary-50 border-opacity-60 rounded-2xl">
						<p className="mb-2">
							Available balance:{' '}
							<span className="text-primary-50">
								{available} {token.toUpperCase()}
							</span>
						</p>
						<div
							className="py-2 px-2.5 bg-background rounded-lg grid gap-5"
							style={{ gridTemplateColumns: 'calc(100% - 60px) 40px' }}>
							<input
								type="text"
								onChange={e => {
									if (!isNumber(e.currentTarget.value)) return;
									setInput(e.currentTarget.value);
								}}
								value={input}
								className="text-xl text-white-emphasis"
							/>
							<button
								onClick={() => setInput(`${available}`)}
								className="my-auto h-6 w-10 bg-primary-200 hover:opacity-75 cursor-pointer flex justify-center items-center rounded-md">
								<p className="text-xs text-white-high leading-none">MAX</p>
							</button>
						</div>
					</div>
					<div className="w-full mt-9 flex items-center justify-center">
						<button
							onClick={() => onTransfer(input)}
							className="w-2/3 h-15 bg-primary-200 rounded-2xl flex items-center justify-center hover:opacity-75">
							<h6>{isWithdraw ? 'Withdraw' : 'Deposit'}</h6>
						</button>
					</div>
				</div>
			</BaseDialog>
		);
	}
);
