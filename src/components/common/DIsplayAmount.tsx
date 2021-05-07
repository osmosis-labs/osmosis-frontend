import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { CoinPretty } from '@keplr-wallet/unit';

export const DisplayAmount: FunctionComponent<{
	wrapperClass?: string;
	textClass?: string;
	currencyClass?: string;
	amount: CoinPretty;
}> = ({ wrapperClass, textClass, currencyClass, amount }) => {
	return (
		<div className={cn('overflow-visible inline-block w-fit', wrapperClass)}>
			<p className="leading-tight">
				{/*
					TODO:...
					 <span
						className={cn('inline-block overflow-visible leading-none font-mono', textClass)}
						dangerouslySetInnerHTML={setAmountStyle(fixed(amount, decimals), sizeInt, sizeInt)}
					/>
					 */}
				<span className={cn('ml-0.5 leading-none', currencyClass ? currencyClass : 'mb-0.25')}>
					{amount
						.trim(true)
						.maxDecimals(6)
						.toString()}
				</span>
			</p>
		</div>
	);
};
