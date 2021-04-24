import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { LINKS, MISC } from '../../../constants';
import { Img } from '../../common/Img';

export const SidebarBottom: FunctionComponent<TSidebarBottom> = ({ openSidebar }) => {
	return (
		<div>
			<button className="bg-primary-200 h-9 w-full rounded-md py-2 px-3 flex items-center justify-center mb-8">
				<Img className="w-5 h-5" src={`${MISC.ASSETS_BASE}/Icons/Wallet.svg`} />
				<p
					style={{ maxWidth: openSidebar ? '105px' : '0px', marginLeft: `${openSidebar ? '12px' : '0px'}` }}
					className="text-sm text-white-high font-bold overflow-x-hidden truncate transition-all">
					Connect Wallet
				</p>
			</button>
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
};
interface TSidebarBottom {
	openSidebar: boolean;
}
