import moment from 'dayjs';
import empty from 'is-empty';
import { memoize } from 'lodash-es';
import toString from 'lodash-es/toString';
import capitalize from 'lodash-es/capitalize';
import isString from 'lodash-es/isString';
import lowerCase from 'lodash-es/lowerCase';
import isNil from 'lodash-es/isNil';

import { TBigInput, fixed, multiply } from './Big';
import { isNumber } from './scripts';
import duration from 'dayjs/plugin/duration';

moment.extend(duration);

export const setAmountStyle = (amount: TBigInput, sizeInt: number, sizeDecimal: number) => {
	const amountArr = formatNumber(amount).split('.');
	return {
		__html: `<span style="font-size:${sizeInt}px;">${amountArr[0]}${amountArr[1] ? '.' : ''}</span>${
			amountArr[1] ? `<span style="font-size:${sizeDecimal}px;">${amountArr[1]}</span>` : ''
		}`,
	};
};

export const formatNumber = (v: TBigInput): string => {
	const str = toString(v);
	if (empty(str)) return 'NaN';
	return formatNum(str);
};

export const applyOptionalDecimal = (v: string): string => {
	if (Number(v.split('.')?.[1]) === 0) return fixed(v, 0);
	return v;
};

export const formatUSD = (v: TBigInput): string => {
	const str = toString(v);
	if (empty(str) || !isNumber(str)) return 'NaN';
	return `$${formatNum(fixed(str, 2))}`;
};

const formatNum = (str: string): string => {
	const n = str,
		p = n.indexOf('.');
	return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, (m, i) => (p < 0 || i < p ? `${m},` : m));
};

export const getDuration = (unix: TBigInput) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return moment.duration(unix);
};

export const get12hrTime = (unix: TBigInput): string => {
	return moment(unix).format('hh:mm:ss A');
};

export const get24hrTime = (unix: TBigInput): string => {
	return moment(unix).format('HH:mm:ss');
};

export const toNormalCase = (str: string): string => capitalize(lowerCase(str));

export const truncateString = (str: string, front: number, back: number) =>
	`${str.substr(0, front)}...${str.substr(str.length - back, str.length)}`;

export const commaizeNumber = memoize((value: string | number) => {
	return String(value).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
});
