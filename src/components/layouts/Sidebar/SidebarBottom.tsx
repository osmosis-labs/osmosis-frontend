import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { LINKS, MISC } from '../../../constants';
import { useAccountConnection } from '../../../hooks/account/useAccountConnection';
import { useStore } from '../../../stores';
import { Img } from '../../common/Img';
import { ConnectAccountButton } from '../../ConnectAccountButton';

export const SidebarBottom: FunctionComponent<TSidebarBottom> = observer(({ openSidebar }) => {
	const { chainStore, accountStore, queriesStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const { isAccountConnected, disconnectAccount, connectAccount } = useAccountConnection();

	return (
		<div>
			{isAccountConnected ? (
				<React.Fragment>
					<div className="flex items-center mb-2">
						<div className="p-4">
							<Img className="w-5 h-5" src={`${MISC.ASSETS_BASE}/Icons/Wallet.svg`} />
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
					<button
						onClick={e => {
							e.preventDefault();
							disconnectAccount();
						}}
						className="bg-transparent border border-opacity-30 border-secondary-200 h-9 w-full rounded-md py-2 px-1 flex items-center justify-center mb-8">
						<Img className="w-5 h-5" src={`${MISC.ASSETS_BASE}/Icons/SignOutSecondary.svg`} />
						<p
							style={{ maxWidth: openSidebar ? '105px' : '0px', marginLeft: `${openSidebar ? '12px' : '0px'}` }}
							className="text-sm text-secondary-200 font-semibold overflow-x-hidden truncate transition-all">
							Sign Out
						</p>
					</button>
				</React.Fragment>
			) : (
				<ConnectAccountButton
					className="h-9"
					onClick={e => {
						e.preventDefault();
						connectAccount();
					}}
				/>
			)}
			<div className={cn('flex items-center transition-all justify-center w-full')}>
				{/*<Img className="w-9 h-9" src={`${MISC.ASSETS_BASE}/Icons/${openSidebar ? 'Menu-in' : 'Menu'}.svg`} />*/}
				<div className="flex items-center transition-all overflow-x-hidden w-full">
					<button
						onClick={() => window.open(LINKS.TWITTER)}
						className="opacity-75 hover:opacity-100 cursor-pointer mb-0.5 mr-1">
						<Img style={{ minWidth: '32px' }} className="w-8 h-8" src={`${MISC.ASSETS_BASE}/Icons/Twitter.svg`} />
					</button>
					<button onClick={() => window.open(LINKS.MEDIUM)} className="opacity-75 hover:opacity-100 cursor-pointer">
						<Img style={{ minWidth: '36px' }} className="w-9 h-9" src={`${MISC.ASSETS_BASE}/Icons/Medium.svg`} />
					</button>
				</div>
			</div>
		</div>
	);
});

interface TSidebarBottom {
	openSidebar: boolean;
}
