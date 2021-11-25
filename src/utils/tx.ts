import { HasOsmosisQueries } from './../stores/osmosis/query/index';
import { OsmosisMsgOpts } from './../stores/osmosis/account/index';
import { AccountSetBase } from '@keplr-wallet/stores';

export function isSlippageError(tx: any): boolean {
	if (tx && tx.code === 7 && tx.codespace === 'gamm' && tx.log?.includes('token is lesser than min amount')) {
		return true;
	}
	return false;
}

/**
 * need to be able to pass onBroadcastFailed, but the original code only was able to handle onFulfill
 * so... it's... a HACKathon, isn't it?
 * this function patches an onFulfill handler onto the onTxEvents arg - in a backwards-compatible way
 */
export function patchOnTxEventsHandler(
	onTxEvents: Parameters<AccountSetBase<OsmosisMsgOpts, HasOsmosisQueries>['sendMsgs']>[5],
	onFulfill: (tx: any) => void
): Parameters<AccountSetBase<OsmosisMsgOpts, HasOsmosisQueries>['sendMsgs']>[5] {
	const isSingleHandlerType = (arg: typeof onTxEvents): arg is (tx: any) => void => typeof onTxEvents === 'function';
	if (onTxEvents === undefined || isSingleHandlerType(onTxEvents)) {
		return (tx: any) => {
			onFulfill(tx);
			onTxEvents?.(tx);
		};
	} else {
		const originalHandler = onTxEvents.onFulfill;
		onTxEvents.onFulfill = (tx: any) => {
			onFulfill(tx);
			originalHandler?.(tx);
		};
		return onTxEvents;
	}
}
