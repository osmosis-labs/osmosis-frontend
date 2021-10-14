import React, { CSSProperties, FunctionComponent, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import QRCode from 'qrcode.react';
import {
	isMobile as checkIsMobile,
	isAndroid as checkIsAndroid,
	saveMobileLinkInfo,
} from '@walletconnect/browser-utils';

import { observer } from 'mobx-react-lite';
import { makeObservable, observable, flow, action } from 'mobx';
import { Keplr } from '@keplr-wallet/types';
import { KeplrWalletConnectV1 } from '@keplr-wallet/wc-client';
import WalletConnect from '@walletconnect/client';
import { BroadcastMode, StdTx } from '@cosmjs/launchpad';
import { EmbedChainInfos, IBCAssetInfos } from 'src/config';
import Axios from 'axios';
import { useAccountConnection } from 'src/hooks/account/useAccountConnection';

import { wrapBaseDialog } from './base';
import { getKeplrFromWindow } from '@keplr-wallet/stores';

const walletList = [
	{
		name: 'Keplr Wallet',
		description: 'Keplr Browser Extension',
		logoUrl: '/public/assets/other-logos/keplr.png',
		type: 'extension',
	},
	{
		name: 'WalletConnect',
		description: 'Keplr Mobile',
		logoUrl: '/public/assets/other-logos/wallet-connect.png',
		type: 'wallet-connect',
	},
];

async function sendTx(chainId: string, stdTx: StdTx, mode: BroadcastMode): Promise<Uint8Array> {
	const params = {
		tx: stdTx,
		mode,
	};

	const restInstance = Axios.create({
		baseURL: EmbedChainInfos.find(chainInfo => chainInfo.chainId === chainId)!.rest,
	});

	const result = await restInstance.post('/txs', params);

	return Buffer.from(result.data.txhash, 'hex');
}

export const WalletConnectQRCodeModal: FunctionComponent<{
	uri: string;
	close: () => void;
}> = ({ uri, close }) => {
	const [isMobile] = useState(() => checkIsMobile());
	const [isAndroid] = useState(() => checkIsAndroid());

	const navigateToAppURL = useMemo(() => {
		if (isMobile) {
			if (isAndroid) {
				// Save the mobile link.
				saveMobileLinkInfo({
					name: 'Keplr',
					href: 'intent://wcV1#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;',
				});

				return `intent://wcV1?${uri}#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;`;
			} else {
				// Save the mobile link.
				saveMobileLinkInfo({
					name: 'Keplr',
					href: 'keplrwallet://wcV1',
				});

				return `keplrwallet://wcV1?${uri}`;
			}
		}
	}, [isMobile, isAndroid, uri]);

	useEffect(() => {
		if (navigateToAppURL) {
			window.location.href = navigateToAppURL;
		}
	}, [navigateToAppURL]);

	if (isMobile) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-100 overflow-y-auto">
			<div className="p-5 flex items-center justify-center min-h-screen">
				<div
					className="fixed inset-0 bg-black opacity-20 flex justify-center items-center"
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();

						close();
					}}
				/>

				<div
					className="relative md:max-w-modal px-4 py-5 md:p-8 bg-surface shadow-elevation-24dp rounded-2xl z-10"
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
					}}>
					<h4 className="text-lg md:text-xl mb-3 md:mb-5 text-white-high">Scan QR Code</h4>
					<div className="p-3.5 bg-background">
						<QRCode size={500} value={uri} />
					</div>

					<img
						onClick={() => close()}
						className="absolute cursor-pointer top-3 md:top-5 right-3 md:right-5 w-8 md:w-10"
						src="/public/assets/Icons/Close.svg"
					/>
				</div>
			</div>
		</div>
	);
};

class WalletConnectQRCodeModalV1Renderer {
	constructor() {}

	open(uri: string, cb: any) {
		const wrapper = document.createElement('div');
		wrapper.setAttribute('id', 'wallet-connect-qrcode-modal-v1');
		document.body.appendChild(wrapper);

		ReactDOM.render(
			<WalletConnectQRCodeModal
				uri={uri}
				close={() => {
					this.close();
					cb();
				}}
			/>,
			wrapper
		);
	}

	close() {
		const wrapper = document.getElementById('wallet-connect-qrcode-modal-v1');
		if (wrapper) {
			document.body.removeChild(wrapper);
		}
	}
}

type WalletType = 'true' | 'extension' | 'wallet-connect' | null;
const KeyConnectingWalletType = 'connecting_wallet_type';
const KeyAutoConnectingWalletType = 'account_auto_connect';

export class ConnectWalletManager {
	protected walletConnector: WalletConnect;

	@observable
	autoConnectingWalletType: WalletType;

	constructor() {
		this.walletConnector = new WalletConnect({
			bridge: 'https://bridge.walletconnect.org',
			signingMethods: [
				'keplr_enable_wallet_connect_v1',
				'keplr_get_key_wallet_connect_v1',
				'keplr_sign_amino_wallet_connect_v1',
			],
			qrcodeModal: new WalletConnectQRCodeModalV1Renderer(),
		});
		this.autoConnectingWalletType = localStorage?.getItem(KeyAutoConnectingWalletType) as WalletType;
		makeObservable(this);
	}

	getKeplr = (): Promise<Keplr | undefined> => {
		const connectingWalletType =
			localStorage?.getItem(KeyAutoConnectingWalletType) || localStorage?.getItem(KeyConnectingWalletType);
		if (connectingWalletType === 'wallet-connect') {
			if (!this.walletConnector.connected) {
				this.walletConnector.createSession();

				return new Promise<Keplr>((resolve, reject) => {
					this.walletConnector.on('connect', error => {
						if (error) {
							reject(error);
						} else {
							localStorage?.removeItem(KeyConnectingWalletType);
							localStorage?.setItem(KeyAutoConnectingWalletType, 'wallet-connect');
							this.autoConnectingWalletType = 'wallet-connect';

							resolve(
								new KeplrWalletConnectV1(this.walletConnector, {
									sendTx,
								})
							);
						}
					});
					this.walletConnector.on('disconnect', error => {
						if (error) {
							reject(error);
						}
						this.disableAutoConnect();
					});
				});
			} else {
				localStorage?.removeItem(KeyConnectingWalletType);
				localStorage?.setItem(KeyAutoConnectingWalletType, 'wallet-connect');
				this.autoConnectingWalletType = 'wallet-connect';

				return Promise.resolve(
					new KeplrWalletConnectV1(this.walletConnector, {
						sendTx,
					})
				);
			}
		} else {
			localStorage?.removeItem(KeyConnectingWalletType);
			localStorage?.setItem(KeyAutoConnectingWalletType, 'extension');
			this.autoConnectingWalletType = 'extension';

			return getKeplrFromWindow();
		}
	};

	disconnectWalletConnect = () => {
		this.walletConnector.killSession();
	};

	@action
	disableAutoConnect = () => {
		localStorage?.removeItem(KeyAutoConnectingWalletType);
		this.autoConnectingWalletType = null;
	};
}

export const ConnectWalletDialog = wrapBaseDialog(
	observer(({ initialFocus, close }: { initialFocus: React.RefObject<HTMLDivElement>; close: () => void }) => {
		const { connectAccount } = useAccountConnection();
		const [isMobile] = useState(() => checkIsMobile());

		return (
			<div ref={initialFocus}>
				<h4 className="text-lg md:text-xl text-white-high">Connect Wallet</h4>
				{walletList
					.filter(wallet => {
						if (isMobile && wallet.type == 'extension') {
							return false;
						}
						return true;
					})
					.map(wallet => (
						<button
							key={wallet.name}
							className="w-full text-left p-3 md:p-5 rounded-2xl bg-background flex items-center mt-4 md:mt-5"
							onClick={() => {
								localStorage.setItem(KeyConnectingWalletType, wallet.type);
								connectAccount();
								close();
							}}>
							<img src={wallet.logoUrl} className="w-12 mr-3 md:w-16 md:mr-5" />
							<div>
								<h5 className="text-base md:text-lg mb-1 text-white-high">{wallet.name}</h5>
								<p className="text-xs md:text-sm text-iconDefault">{wallet.description}</p>
							</div>
						</button>
					))}
			</div>
		);
	})
);
