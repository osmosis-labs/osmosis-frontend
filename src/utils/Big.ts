import B from 'big.js';
import empty from 'is-empty';
import each from 'lodash-es/each';
import isFinite from 'lodash-es/isFinite';
import isNumber from 'lodash-es/isNumber';

B.NE = -10;
B.PE = 100;

//  for high accuracy
const DEFAULT_PLACES = 20;

export type TBigInput = number | string;

//  necessary for decimal precision due to javascript being javascript.
//  ofc.
export const big = (input: TBigInput) => {
	const ret = new B(input);
	return ret ? ret : new B('0');
};

export const mod = (input1: TBigInput, input2: TBigInput) => {
	try {
		return new B(input1).mod(new B(input2)).toFixed(0);
	} catch (ex) {
		console.warn('mod error', input1, input2);
		return '1';
	}
};

export const fixed = (input: TBigInput, places: number): string => {
	try {
		return new B(input).toFixed(isNumber(places) ? places : 2);
	} catch (ex) {
		return fixed(0, 2);
	}
};

export const gte = (input1: TBigInput, input2: TBigInput): boolean => {
	return new B(empty(input1) ? 0 : input1).gte(new B(empty(input2) ? 0 : input2));
};

export const gt = (input1: TBigInput, input2: TBigInput): boolean => {
	return new B(empty(input1) ? 0 : input1).gt(new B(empty(input2) ? 0 : input2));
};

export const add = (input1: TBigInput, input2: TBigInput, places = DEFAULT_PLACES): string => {
	try {
		return new B(empty(input1) ? 0 : input1).plus(empty(input2) ? 0 : input2).toFixed(places);
	} catch (ex) {
		// console.warn(`Big error ${input1} * ${input2}`, ex.message);
		return '0';
	}
};

export const sumArray = (inputArray: TBigInput[], places = DEFAULT_PLACES): string => {
	let sum = '0';
	each(inputArray, v => {
		sum = add(sum, v, places);
	});
	return sum;
};

export const minus = (input1: TBigInput, input2: TBigInput, places = DEFAULT_PLACES) => {
	try {
		return new B(input1).minus(input2).toFixed(places);
	} catch (ex) {
		// console.warn(`Big error ${input1} * ${input2}`, ex.message);
		return '0';
	}
};

export const multiply = (input1: TBigInput, input2: TBigInput, places = DEFAULT_PLACES) => {
	try {
		return new B(input1).times(input2).toFixed(places);
	} catch (ex) {
		console.warn(`Big error ${input1} * ${input2}`, ex.message);
		return '0';
	}
};

export const divide = (input1: TBigInput, input2: TBigInput, places = DEFAULT_PLACES) => {
	try {
		if (isZero(input2)) return 'NaN';
		else if (!isFinite(Number(input2)) || !isFinite(Number(input1))) return 'NaN';
		return new B(input1).div(input2).toFixed(places);
	} catch (ex) {
		console.warn(`Big error ${input1} / ${input2}`, ex.message);
		return '0';
	}
};

const isZero = (v: unknown) => Number(v) === 0;
