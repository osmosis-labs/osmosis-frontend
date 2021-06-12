import map from 'lodash-es/map';
import keys from 'lodash-es/keys';

export const mapKeyValues = (obj: Record<string, unknown>, cb: CallableFunction) =>
	map(keys(obj), key => cb(key, obj[key]));

export const isAlphanumeric = (input: string): boolean => {
	return /^[a-z0-9]+$/i.test(input);
};

export const isNumber = (input: string): boolean => !isNaN(Number(input));
