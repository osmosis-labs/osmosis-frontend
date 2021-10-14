import { WalletStatus } from '@keplr-wallet/stores';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from '../../stores';

const KeyAccountAutoConnect = 'account_auto_connect';

export function useAccountConnection() {
	const { chainStore, accountStore, connectWalletManager } = useStore();
	const [isOpenDialog, setIsOpenDialog] = useState(false);

	const account = accountStore.getAccount(chainStore.current.chainId);

	// Even though the wallet is not loaded, if `shouldAutoConnectAccount` is true, set the `isAccountConnected` as true.
	// Because the initing the wallet is asyncronous, when users enter the site the wallet is seen as not loaded.
	// To reduce this problem, if the wallet is connected when users enter the site, just assume that the wallet is already connected.
	const isAccountConnected =
		account.walletStatus === WalletStatus.Loaded || connectWalletManager.autoConnectingWalletType;

	const disconnectAccount = useCallback(async () => {
		account.disconnect();
		connectWalletManager.disableAutoConnect();
		connectWalletManager.disconnectWalletConnect();
	}, [account, connectWalletManager]);

	const connectAccount = useCallback(() => {
		account.init();
	}, [account]);

	const openDialog = useCallback(() => setIsOpenDialog(true), [setIsOpenDialog]);
	const closeDialog = useCallback(() => setIsOpenDialog(false), [setIsOpenDialog]);

	useEffect(() => {
		// 이전에 로그인한 후에 sign out을 명시적으로 하지 않았으면 자동으로 로그인한다.
		if (!!connectWalletManager.autoConnectingWalletType && account.walletStatus === WalletStatus.NotInit) {
			account.init();
		}

		// 다른 앱에서 WalletConnect를 disconnect했으면 자동으로 로그아웃한다.
		if (account.walletStatus === WalletStatus.Loaded && !connectWalletManager.autoConnectingWalletType) {
			account.disconnect();
		}
	}, [account, connectWalletManager.autoConnectingWalletType]);

	return useMemo(() => {
		return {
			isAccountConnected,
			disconnectAccount,
			connectAccount,
			isOpenDialog,
			openDialog,
			closeDialog,
		};
	}, [connectAccount, disconnectAccount, isAccountConnected, isOpenDialog, openDialog, closeDialog]);
}
