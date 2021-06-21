import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from '../../stores';

const KeyAccountAutoConnect = 'account_auto_connect';

export function useAccountConnection() {
	const { chainStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);

	const shouldAutoConnectAccount = localStorage?.getItem(KeyAccountAutoConnect) != null;
	const isAccountConnected = account.bech32Address !== '';

	const disconnectAccount = useCallback(() => {
		localStorage?.removeItem(KeyAccountAutoConnect);
		account.disconnect();
	}, [account]);

	const connectAccount = useCallback(() => {
		localStorage?.setItem(KeyAccountAutoConnect, 'true');
		account.init();
	}, [account]);

	useEffect(() => {
		// 이전에 로그인한 후에 sign out을 명시적으로 하지 않았으면 자동으로 로그인한다.
		if (shouldAutoConnectAccount && !isAccountConnected) {
			console.log('TODO: init called');
			account.init();
		}
	}, [account, isAccountConnected, shouldAutoConnectAccount]);

	return useMemo(() => {
		return {
			isAccountConnected,
			disconnectAccount,
			connectAccount,
		};
	}, [connectAccount, disconnectAccount, isAccountConnected]);
}
