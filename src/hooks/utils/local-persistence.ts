import _ from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { useLocalStorage } from 'react-use';

export type PersistenceData = { [key: string]: any };

/** Wrapper around LocalStorage to simplify DX */
export function useLocalStoragePersistence(
	key: string
): {
	localStorage: PersistenceData;
	setLocalStorage: Dispatch<SetStateAction<PersistenceData | undefined>>;
	/** Hook to use like useState but it will save & load from LocalStorage transparently */
	useLocalStorageState: <T, SERIALIZED>(
		path: string[],
		defaul: T,
		serialization?: { serialize?: (val: T) => SERIALIZED; deserialize?: (val: SERIALIZED) => T }
	) => any[];
} {
	const [loaded, setLocalStorage] = useLocalStorage(key, {} as PersistenceData);
	const localStorage = loaded ?? {};

	const useLocalStorageState = <T, SERIALIZED>(
		path: string[],
		defaul: T,
		serialization?: { serialize?: (val: T) => SERIALIZED; deserialize?: (val: SERIALIZED) => T }
	) => {
		// store deserialised copy in memory
		const [val, setVal] = useState(() => {
			const data = _.get(localStorage, path, defaul);
			return serialization?.deserialize ? serialization.deserialize(data) : data;
		});
		return [
			val,
			(newVal: T) => {
				setVal(newVal);
				setLocalStorage(s => _.set(s ?? {}, path, serialization?.serialize ? serialization.serialize(newVal) : newVal));
			},
		];
	};

	return { localStorage, setLocalStorage, useLocalStorageState };
}
