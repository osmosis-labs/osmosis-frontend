import React, { FunctionComponent, useEffect } from 'react';
import cn from 'clsx';
import { LINKS, MISC } from '../../../constants';
import { Img } from '../../common/Img';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';

const KeyAccountAutoConnect = 'account_auto_connect';

export const SidebarBottom: FunctionComponent<TSidebarBottom> = observer(({ openSidebar }) => {
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const accountAutoConnect = localStorage.getItem(KeyAccountAutoConnect) != null;

	useEffect(() => {
		// 이전에 로그인한 후에 sign out을 명시적으로 하지 않았으면 자동으로 로그인한다.
		if (accountAutoConnect) {
			account.init();
		}
	}, []);

	const accountIsConnected = account.bech32Address !== '' || accountAutoConnect;

	return (
		<div>
			{accountIsConnected ? (
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

							// TODO: 헐... account에 disconnect하는 메소드가 아직 없음...
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
				<button
					onClick={e => {
						e.preventDefault();

						localStorage.setItem(KeyAccountAutoConnect, 'true');
						account.init();
					}}
					className="bg-primary-200 h-9 w-full rounded-md py-2 px-1 flex items-center justify-center mb-8">
					<Img className="w-5 h-5" src={`${MISC.ASSETS_BASE}/Icons/Wallet.svg`} />
					<p
						style={{ maxWidth: openSidebar ? '105px' : '0px', marginLeft: `${openSidebar ? '12px' : '0px'}` }}
						className="text-sm text-white-high font-semibold overflow-x-hidden truncate transition-all">
						Connect Wallet
					</p>
				</button>
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
