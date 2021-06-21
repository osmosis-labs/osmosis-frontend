import cn from 'clsx';
import * as React from 'react';
import { MISC } from '../constants';
import { Img } from './common/Img';

export function ConnectAccountButton({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={cn('bg-primary-200 w-full rounded-md py-2 px-1 flex items-center justify-center mb-8', className)}
			{...props}>
			<Img className="w-5 h-5" src={`${MISC.ASSETS_BASE}/Icons/Wallet.svg`} />
			<p
				style={{ maxWidth: '105px', marginLeft: '12px' }}
				className="text-sm text-white-high font-semibold overflow-x-hidden truncate transition-all">
				Connect Wallet
			</p>
		</button>
	);
}
