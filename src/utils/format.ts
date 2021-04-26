import moment from 'dayjs';
import empty from 'is-empty';
import toString from 'lodash-es/toString';
import capitalize from 'lodash-es/capitalize';
import isString from 'lodash-es/isString';
import lowerCase from 'lodash-es/lowerCase';

import { TBigInput, fixed, multiply } from './Big';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const duration = require('dayjs/plugin/duration');
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

const formatNum = (str: string): string => {
	const n = str,
		p = n.indexOf('.');
	return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, (m, i) => (p < 0 || i < p ? `${m},` : m));
};

export const get12hrTime = (unix: TBigInput): string => {
	return moment(unix).format('hh:mm:ss A');
};

export const get24hrTime = (unix: TBigInput): string => {
	return moment(unix).format('HH:mm:ss');
};

export const toNormalCase = (str: string): string => capitalize(lowerCase(str));
