import { FunctionComponent } from 'react';
import noop from 'lodash-es/noop';
import { Img } from './Img';
import { LINKS } from '../../constants';
import cn from 'clsx';
import * as React from 'react';
import { AppCurrency } from '@keplr-wallet/types';

export const TokenDisplay: FunctionComponent<{
	currency: AppCurrency;
	openSelector?: boolean;
	setOpenSelector?: (bool: boolean | ((bool: boolean) => boolean)) => void;
}> = ({ currency, openSelector, setOpenSelector = noop }) => {
	const displayDenom = (() => {
		// IBC Currency일 경우라도 채널 정보등은 없이 그냥 원래의 코인 디놈 자체만 보여준다.
		if ('originCurrency' in currency && currency.originCurrency) {
			return currency.originCurrency.coinDenom;
		}

		return currency.coinDenom;
	})();

	return (
		<div className="flex items-center">
			<figure
				style={{ width: '56px', height: '56px' }}
				className="flex justify-center items-center rounded-full border-secondary-200 border mr-3">
				<Img loadingSpin style={{ width: '44px', height: '44px' }} src={LINKS.GET_TOKEN_IMG(displayDenom)} />
			</figure>
			<div className="flex flex-col">
				<div className="flex items-center">
					<h5 className="leading-none font-semibold">{displayDenom.toUpperCase()}</h5>
					<Img
						onClick={() => setOpenSelector((v: boolean) => !v)}
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
};
