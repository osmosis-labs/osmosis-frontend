import { WalletStatus } from '@keplr-wallet/stores';
import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from '../../stores';

const KeyAccountAutoConnect = 'account_auto_connect';

export function useAccountConnection() {
	const { chainStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);

	const shouldAutoConnectAccount = localStorage?.getItem(KeyAccountAutoConnect) != null;
	// Even though the wallet is not loaded, if `shouldAutoConnectAccount` is true, set the `isAccountConnected` as true.
	// Because the initing the wallet is asyncronous, when users enter the site the wallet is seen as not loaded.
	// To reduce this problem, if the wallet is connected when users enter the site, just assume that the wallet is already connected.
	const isAccountConnected = account.walletStatus === WalletStatus.Loaded || shouldAutoConnectAccount;

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
		if (shouldAutoConnectAccount && account.walletStatus === WalletStatus.NotInit) {
			account.init();
		}
	}, [account, shouldAutoConnectAccount]);

	return useMemo(() => {
		return {
			isAccountConnected,
			disconnectAccount,
			connectAccount,
		};
	}, [connectAccount, disconnectAccount, isAccountConnected]);
}
