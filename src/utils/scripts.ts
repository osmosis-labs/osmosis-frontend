import map from 'lodash-es/map';
import keys from 'lodash-es/keys';

export const mapKeyValues = (obj: Record<string, unknown>, cb: CallableFunction) =>
	map(keys(obj), key => cb(key, obj[key]));
