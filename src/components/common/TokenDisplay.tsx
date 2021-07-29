import { AppCurrency } from '@keplr-wallet/types';
import cn from 'clsx';
import noop from 'lodash-es/noop';
import React from 'react';
import { Img } from './Img';

export function TokenDisplay({
	currency,
	openSelector,
	setOpenSelector = noop,
}: {
	currency: AppCurrency;
	openSelector?: boolean;
	setOpenSelector?: (bool: boolean | ((bool: boolean) => boolean)) => void;
}) {
	return (
		<div
			className="flex items-center"
			style={{ cursor: 'pointer' }}
			onClick={() => setOpenSelector((v: boolean) => !v)}>
			<figure
				style={{ minWidth: '56px', minHeight: '56px', maxWidth: '56px', maxHeight: '56px' }}
				className="flex justify-center items-center rounded-full border-secondary-200 border mr-3">
				<Img loadingSpin style={{ width: '44px', height: '44px' }} src={currency.coinImageUrl} />
			</figure>
			<div className="flex flex-col">
				<div className="flex items-center">
					<h5 className="leading-none font-semibold">{currency.coinDenom.toUpperCase()}</h5>
					<Img
						className={cn(
							'h-6 w-8 ml-1 p-2 cursor-pointer opacity-40 hover:opacity-100',
							openSelector ? 'rotate-180' : ''
						)}
						src="/public/assets/Icons/Down.svg"
					/>
				</div>
			</div>
		</div>
	);
}
