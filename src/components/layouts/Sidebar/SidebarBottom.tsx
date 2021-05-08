import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { LINKS, MISC } from '../../../constants';
import { Img } from '../../common/Img';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';

export const SidebarBottom: FunctionComponent<TSidebarBottom> = observer(({ openSidebar }) => {
	const { chainStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);

	const buttonClick = React.useCallback(() => {
		account.init();
	}, []);

	return (
		<div>
			{/* TODO: 계정이 불러와져 있으면 뭘 표시하지? (아마 주소?) and 계정 불러오는 중의 짧은 시간 동안 로딩 인디케이터 표시? */}
			{account.bech32Address ? null : (
				<button
					onClick={buttonClick}
					className="bg-primary-200 h-9 w-full rounded-md py-2 px-1 flex items-center justify-center mb-8">
					<Img className="w-5 h-5" src={`${MISC.ASSETS_BASE}/Icons/Wallet.svg`} />
					<p
						style={{ maxWidth: openSidebar ? '105px' : '0px', marginLeft: `${openSidebar ? '12px' : '0px'}` }}
						className="text-sm text-white-high font-semibold overflow-x-hidden truncate transition-all">
						Connect Wallet
					</p>
				</button>
			)}
			<div className={cn('flex items-center transition-all justify-center')}>
				<Img className="w-9 h-9" src={`${MISC.ASSETS_BASE}/Icons/${openSidebar ? 'Menu-in' : 'Menu'}.svg`} />
				<div
					className="flex items-center transition-all overflow-x-hidden"
					style={{ maxWidth: `${openSidebar ? '62px' : '0px'}`, marginLeft: `${openSidebar ? '55px' : '0px'}` }}>
					<button onClick={() => window.open(LINKS.TWITTER)} className="hover:opacity-75 cursor-pointer mb-0.5 mr-1">
						<Img style={{ minWidth: '32px' }} className="w-8 h-8" src={`${MISC.ASSETS_BASE}/Icons/Twitter.svg`} />
					</button>
					<button onClick={() => window.open(LINKS.MEDIUM)} className="hover:opacity-75 cursor-pointer">
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
