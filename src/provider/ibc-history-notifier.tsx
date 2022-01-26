import React, { FunctionComponent, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores';
import { IBCTransferHistory } from '../stores/ibc-history';
import { ChainIdHelper } from '@keplr-wallet/cosmos';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { toast, ToastOptions } from 'react-toastify';

const CloseButton: FunctionComponent<{ closeToast: () => void }> = ({ closeToast }) => (
	<button
		onClick={closeToast}
		style={{ left: '-8px', top: '-8px' }}
		className="hover:opacity-75 absolute z-100 h-6 w-6">
		<img alt="x" className="w-full h-full" src="/public/assets/Icons/ToastClose.png" />
	</button>
);

const defaultOptions = {
	position: 'top-right',
	autoClose: 7000,
	hideProgressBar: true,
	closeOnClick: false,
	pauseOnHover: true,
	draggable: false,
	progress: undefined,
	pauseOnFocusLoss: false,
	closeButton: CloseButton,
};

export const ToastIBCTransferComplete: FunctionComponent<{
	history: IBCTransferHistory;
}> = observer(({ history }) => {
	const { chainStore } = useStore();

	const amount = new CoinPretty(history.amount.currency, new Dec(history.amount.amount)).decreasePrecision(
		history.amount.currency.coinDecimals
	);

	return (
		<div className="grid gap-3.75" style={{ gridTemplateColumns: '32px 1fr' }}>
			<img alt="b" style={{ width: '32px', height: '32px' }} src="/public/assets/Icons/ToastSuccess.png" />
			<section className="text-white-high">
				<h6 className="mb-2">IBC Transfer Successful</h6>
				{ChainIdHelper.parse(chainStore.current.chainId).identifier ===
				ChainIdHelper.parse(history.destChainId).identifier
					? `${amount
							.maxDecimals(6)
							.trim(true)
							.shrink(true)} has been successfully deposited`
					: `${amount
							.maxDecimals(6)
							.trim(true)
							.shrink(true)} has been successfully withdrawn`}
			</section>
		</div>
	);
});

export const ToastIBCTransferTimeout: FunctionComponent<{
	history: IBCTransferHistory;
}> = observer(({ history }) => {
	const { chainStore } = useStore();

	const amount = new CoinPretty(history.amount.currency, new Dec(history.amount.amount)).decreasePrecision(
		history.amount.currency.coinDecimals
	);

	return (
		<div className="grid gap-3" style={{ gridTemplateColumns: '32px 1fr' }}>
			<img alt="x" style={{ width: '32px', height: '32px' }} src="/public/assets/Icons/FailedTx.png" />
			<section className="text-white-high">
				<h6 className="mb-2">IBC Transfer Timeout</h6>
				{ChainIdHelper.parse(chainStore.current.chainId).identifier ===
				ChainIdHelper.parse(history.destChainId).identifier
					? `${amount
							.maxDecimals(6)
							.trim(true)
							.shrink(true)} has been failed deposited`
					: `${amount
							.maxDecimals(6)
							.trim(true)
							.shrink(true)} has been failed withdrawn`}
			</section>
		</div>
	);
});

export const ToastIBCTransferRefunded: FunctionComponent<{
	history: IBCTransferHistory;
}> = observer(({ history }) => {
	const amount = new CoinPretty(history.amount.currency, new Dec(history.amount.amount)).decreasePrecision(
		history.amount.currency.coinDecimals
	);

	return (
		<div className="grid gap-3.75" style={{ gridTemplateColumns: '32px 1fr' }}>
			<img alt="b" style={{ width: '32px', height: '32px' }} src="/public/assets/Icons/ToastSuccess.png" />
			<section className="text-white-high">
				<h6 className="mb-2">IBC Transfer Successful</h6>
				{`${amount
					.maxDecimals(6)
					.trim(true)
					.shrink(true)} has been successfully refunded`}
			</section>
		</div>
	);
});

/**
 * IBCHistoryNotifier tracks the changes of the IBC Transfer history on the IBCTransferHistoryStore.
 * And, if the changes are detected, this will notify the success or failure to the users, and update the balances.
 * XXX: `IBCHistoryNotifier` doesn't render anything.
 */
export const IBCHistoryNotifier: FunctionComponent = observer(() => {
	const { chainStore, queriesStore, ibcTransferHistoryStore, accountStore } = useStore();

	useEffect(() => {
		ibcTransferHistoryStore.addHistoryChangedHandler(history => {
			if (chainStore.hasChain(history.destChainId)) {
				// Toast the notification should use the `useToast()` context API.
				// But, it is not yet flexible and it is the thing to be being refactored.
				// It just uses the "toast" libaray, so for now, just use that library directly before the `useToast()` hook refactored.
				if (history.status === 'complete') {
					toast(<ToastIBCTransferComplete history={history} />, defaultOptions as ToastOptions);
				} else if (history.status === 'timeout') {
					toast(<ToastIBCTransferTimeout history={history} />, defaultOptions as ToastOptions);
				} else if (history.status === 'refunded') {
					toast(<ToastIBCTransferRefunded history={history} />, defaultOptions as ToastOptions);
				}

				const account = accountStore.getAccount(chainStore.current.chainId);
				if (history.sender === account.bech32Address || history.recipient === account.bech32Address) {
					if (history.status === 'complete') {
						queriesStore
							.get(history.destChainId)
							.queryBalances.getQueryBech32Address(history.recipient)
							.fetch();
					} else if (history.status === 'refunded') {
						queriesStore
							.get(history.sourceChainId)
							.queryBalances.getQueryBech32Address(history.recipient)
							.fetch();
					}
				}
			}
		});
	}, [ibcTransferHistoryStore]);

	return null;
});
