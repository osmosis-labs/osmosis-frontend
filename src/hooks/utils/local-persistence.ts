import { useLocalStorage } from 'react-use';
import { Dispatch, SetStateAction, useState } from 'react';
import _ from 'lodash';

export type PersistenceData = { [key: string]: any };

/** Wrapper around LocalStorage to simplify DX */
export function useLocalStoragePersistence(
	key: string
): {
	localStorage: PersistenceData;
	setLocalStorage: Dispatch<SetStateAction<PersistenceData | undefined>>;
	useLocalStorageState: <T extends unknown>(path: string[], defaul: T) => any[];
} {
	const [loaded, setLocalStorage] = useLocalStorage(key, {} as PersistenceData);
	const localStorage = loaded ?? {};

	const useLocalStorageState = <T extends unknown>(path: string[], defaul: T) => {
		const [val, setVal] = useState(_.get(localStorage, path, defaul));
		return [
			val,
			(newVal: T) => {
				setVal(newVal);
				setLocalStorage(s => _.set(s ?? {}, path, newVal));
			},
		];
	};

	return { localStorage, setLocalStorage, useLocalStorageState };
}
