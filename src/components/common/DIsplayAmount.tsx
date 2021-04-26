import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { setAmountStyle } from '../../utils/format';
import { TBigInput, fixed } from '../../utils/Big';

export const DisplayAmount: FunctionComponent<TDisplayAmount> = ({
	wrapperClass,
	textClass,
	currencyClass,
	amount,
	decimals = 2,
	sizeInt = 12,
	sizeDecimal = 12,
	sizeCurrency = 12,
	currency,
}) => {
	return (
		<div className={cn('overflow-visible inline-block w-fit', wrapperClass)}>
			<p className="leading-tight">
				<span
					className={cn('inline-block overflow-visible leading-none font-mono', textClass)}
					dangerouslySetInnerHTML={setAmountStyle(fixed(amount, decimals), sizeInt, sizeInt)}
				/>
				<span
					style={sizeCurrency ? { fontSize: `${sizeCurrency}px` } : undefined}
					className={cn('ml-0.5 leading-none', currencyClass ? currencyClass : 'mb-0.25')}>
					{currency}
				</span>
			</p>
		</div>
	);
};
interface TDisplayAmount {
	wrapperClass?: string;
	textClass?: string;
	currencyClass?: string;
	amount: TBigInput;
	decimals?: number;
	sizeInt?: number;
	sizeDecimal?: number;
	sizeCurrency?: number;
	currency: string;
}
