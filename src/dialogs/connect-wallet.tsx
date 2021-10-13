import React, { CSSProperties, FunctionComponent, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import QRCode from 'qrcode.react';
import { isMobile, isAndroid, saveMobileLinkInfo } from '@walletconnect/browser-utils';

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

declare global {
	interface Window {
		opera: any;
	}
}

export type ModalUIOptions = {
	backdrop?: {
		className?: string;
		style?: CSSProperties;
		disableDefaultStyle?: boolean;
	};
	modalContainer?: {
		className?: string;
		style?: CSSProperties;
		disableDefaultStyle?: boolean;
	};
	modalHeader?: {
		className?: string;
		style?: CSSProperties;
		disableDefaultStyle?: boolean;
	};
	qrCodeContainer?: {
		className?: string;
		style?: CSSProperties;
	};
	qrCodeSize?: number;
	appButtonContainer?: {
		className?: string;
		style?: CSSProperties;
	};
	appButton?: {
		className?: string;
		style?: CSSProperties;
	};
};

export const Modal: FunctionComponent<{
	uiOptions?: ModalUIOptions;

	uri: string;
	close: () => void;
}> = ({ uiOptions, uri, close }) => {
	const [checkMobile] = useState(() => isMobile());
	const [checkAndroid] = useState(() => isAndroid());

	const navigateToAppURL = useMemo(() => {
		if (checkMobile) {
			if (checkAndroid) {
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
	}, [checkAndroid, checkMobile, uri]);

	useEffect(() => {
		// Try opening the app without interaction.
		if (navigateToAppURL) {
			window.location.href = navigateToAppURL;
		}
	}, [navigateToAppURL]);

	return (
		<React.Fragment>
			<div
				className={uiOptions?.backdrop?.className}
				style={{
					...(uiOptions?.backdrop?.disableDefaultStyle
						? {}
						: {
								position: 'fixed',
								top: 0,
								bottom: 0,
								left: 0,
								right: 0,
								backgroundColor: 'rgba(0,0,0,0.1)',

								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
						  }),
					...uiOptions?.backdrop?.style,
				}}
				onClick={e => {
					e.preventDefault();
					e.stopPropagation();

					close();
				}}>
				<div
					className={uiOptions?.modalContainer?.className}
					style={{
						...(uiOptions?.modalContainer?.disableDefaultStyle
							? {}
							: {
									padding: 20,
									borderRadius: 10,
									backgroundColor: '#DDDDDD',
							  }),
						...uiOptions?.modalContainer?.style,
					}}
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
					}}>
					{!checkMobile ? (
						<React.Fragment>
							<h3
								className={uiOptions?.modalHeader?.className}
								style={{
									...(uiOptions?.modalHeader?.disableDefaultStyle
										? {}
										: {
												fontSize: 20,
												margin: 0,
												marginBottom: 10,
										  }),
									...uiOptions?.modalHeader?.style,
								}}>
								Scan QR Code
							</h3>
							<div className={uiOptions?.qrCodeContainer?.className} style={uiOptions?.qrCodeContainer?.style}>
								<QRCode size={uiOptions?.qrCodeSize || 500} value={uri} />
							</div>
						</React.Fragment>
					) : (
						<React.Fragment>
							<h3
								className={uiOptions?.modalHeader?.className}
								style={{
									...(uiOptions?.modalHeader?.disableDefaultStyle
										? {}
										: {
												fontSize: 20,
												margin: 0,
												marginBottom: 10,
										  }),
									...uiOptions?.modalHeader?.style,
								}}>
								Open App
							</h3>
							<div className={uiOptions?.appButtonContainer?.className} style={uiOptions?.appButtonContainer?.style}>
								<button
									className={uiOptions?.appButton?.className}
									style={uiOptions?.appButton?.style}
									onClick={() => {
										if (navigateToAppURL) {
											window.location.href = navigateToAppURL;
										}
									}}>
									Open App
								</button>
							</div>
						</React.Fragment>
					)}
				</div>
			</div>
		</React.Fragment>
	);
};

class WalletConnectQRCodeModalV1 {
	constructor(protected readonly uiOptions?: ModalUIOptions) {}

	open(uri: string, cb: any) {
		const wrapper = document.createElement('div');
		wrapper.setAttribute('id', 'wallet-connect-qrcode-modal-v1');
		document.body.appendChild(wrapper);

		ReactDOM.render(
			<Modal
				uri={uri}
				close={() => {
					this.close();
					cb();
				}}
				uiOptions={this.uiOptions}
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

type WalletType = 'true' | 'extension' | 'wallet-connect';
const KeyConnectingWalletType = 'connecting_wallet_type';
const KeyAutoConnectingWalletType = 'account_auto_connect';

export class ConnectWalletManager {
	constructor() {}

	getKeplr(): Promise<Keplr | undefined> {
		const connectingWalletType =
			localStorage?.getItem(KeyAutoConnectingWalletType) || localStorage?.getItem(KeyConnectingWalletType);
		if (connectingWalletType === 'wallet-connect') {
			const connector = new WalletConnect({
				bridge: 'https://bridge.walletconnect.org',
				signingMethods: [
					'keplr_enable_wallet_connect_v1',
					'keplr_get_key_wallet_connect_v1',
					'keplr_sign_amino_wallet_connect_v1',
				],
				qrcodeModal: new WalletConnectQRCodeModalV1(),
			});

			// Check if connection is already established
			if (!connector.connected) {
				// create new session
				connector.createSession();

				return new Promise<Keplr>((resolve, reject) => {
					connector.on('connect', error => {
						if (error) {
							reject(error);
						} else {
							localStorage?.removeItem(KeyConnectingWalletType);
							localStorage?.setItem(KeyAutoConnectingWalletType, 'wallet-connect');
							resolve(
								new KeplrWalletConnectV1(connector, {
									sendTx,
								})
							);
						}
					});
				});
			} else {
				localStorage?.removeItem(KeyConnectingWalletType);
				localStorage?.setItem(KeyAutoConnectingWalletType, 'wallet-connect');
				return Promise.resolve(
					new KeplrWalletConnectV1(connector, {
						sendTx,
					})
				);
			}
		} else {
			localStorage?.removeItem(KeyConnectingWalletType);
			localStorage?.setItem(KeyAutoConnectingWalletType, 'extension');
			return getKeplrFromWindow();
		}
	}
}

export const ConnectWalletDialog = wrapBaseDialog(
	observer(({ initialFocus }: { initialFocus: React.RefObject<HTMLDivElement> }) => {
		const { connectAccount } = useAccountConnection();

		return (
			<div ref={initialFocus}>
				<h4 className="text-lg md:text-xl text-white-high">Connect Wallet</h4>
				{walletList.map(wallet => (
					<button
						key={wallet.name}
						className="w-full text-left p-3 md:p-5 rounded-2xl bg-background flex items-center mt-4 md:mt-5"
						onClick={() => {
							localStorage.setItem(KeyConnectingWalletType, wallet.type);
							connectAccount();
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
