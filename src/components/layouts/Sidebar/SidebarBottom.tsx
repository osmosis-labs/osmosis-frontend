import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { LINKS, MISC } from '../../../constants';
import { useAccountConnection } from '../../../hooks/account/useAccountConnection';
import { useStore } from '../../../stores';
import { ConnectAccountButton } from '../../ConnectAccountButton';

export const SidebarBottom: FunctionComponent = observer(() => {
	const { chainStore, accountStore, queriesStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const { isAccountConnected, connectAccount, disconnectAccount, isMobileWeb } = useAccountConnection();

	return (
		<div>
			{isAccountConnected ? (
				<React.Fragment>
					<div className="flex items-center mb-2">
						<div className="p-4">
							<img alt="wallet" className="w-5 h-5" src={`${MISC.ASSETS_BASE}/Icons/Wallet.svg`} />
						</div>
						<div className="flex flex-col">
							<p className="font-semibold text-white-high text-base">{account.name}</p>
							<p className="opacity-50 text-white-emphasis text-sm">
								{queries.queryBalances
									.getQueryBech32Address(account.bech32Address)
									.stakable.balance.trim(true)
									.maxDecimals(2)
									.shrink(true)
									.upperCase(true)
									.toString()}
							</p>
						</div>
					</div>
					{!isMobileWeb ? (
						<button
							onClick={e => {
								e.preventDefault();
								disconnectAccount();
							}}
							className="bg-transparent border border-opacity-30 border-secondary-200 h-9 w-full rounded-md py-2 px-1 flex items-center justify-center mb-8">
							<img alt="sign-out" className="w-5 h-5" src={`${MISC.ASSETS_BASE}/Icons/SignOutSecondary.svg`} />
							<p className="text-sm max-w-24 ml-3 text-secondary-200 font-semibold overflow-x-hidden truncate transition-all">
								Sign Out
							</p>
						</button>
					) : null}
				</React.Fragment>
			) : (
				<ConnectAccountButton
					style={{ marginBottom: '32px' }}
					className="h-9"
					textStyle={{ fontSize: '14px' }}
					onClick={e => {
						e.preventDefault();
						connectAccount();
					}}
				/>
			)}
			<p className="py-2 text-xs text-white-high text-center opacity-30">
				Price Data by
				<a href="https://www.coingecko.com" target="_blank" rel="noreferrer">
					{' CoinGecko'}
				</a>
			</p>
			<div className={'flex items-center transition-all w-full'}>
				{/*<Img className="w-9 h-9" src={`${MISC.ASSETS_BASE}/Icons/${openSidebar ? 'Menu-in' : 'Menu'}.svg`} />*/}
				<div
					className="flex items-center transition-all overflow-x-hidden w-full"
					style={{ justifyContent: 'space-around' }}>
					<button
						onClick={() => window.open(LINKS.TWITTER)}
						className="opacity-75 hover:opacity-100 cursor-pointer mb-0.5 mr-1">
						<img
							alt="twitter"
							style={{ minWidth: '32px' }}
							className="w-8 h-8"
							src={`${MISC.ASSETS_BASE}/Icons/Twitter.svg`}
						/>
					</button>
					<button
						onClick={() => window.open(LINKS.MEDIUM)}
						className="opacity-75 hover:opacity-100 cursor-pointer mr-1">
						<img
							alt="medium"
							style={{ minWidth: '36px' }}
							className="w-9 h-9"
							src={`${MISC.ASSETS_BASE}/Icons/Medium.svg`}
						/>
					</button>
					<button
						onClick={() => window.open(LINKS.DISCORD)}
						className="opacity-75 hover:opacity-100 cursor-pointer mb-0.5">
						<img
							alt="discord"
							style={{ minWidth: '36px' }}
							className="w-9 h-9"
							src={`${MISC.ASSETS_BASE}/Icons/Discord.svg`}
						/>
					</button>
					<button
						onClick={() => window.open(LINKS.TELEGRAM)}
						className="opacity-75 hover:opacity-100 cursor-pointer mb-0.5">
						<img
							alt="telegram"
							style={{ minWidth: '36px' }}
							className="w-9 h-9"
							src={`${MISC.ASSETS_BASE}/Icons/Telegram.svg`}
						/>
					</button>
				</div>
			</div>
		</div>
	);
});
