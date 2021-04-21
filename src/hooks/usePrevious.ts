import { useRef, useEffect, MutableRefObject } from 'react';

export function usePrevious<T>(value: T): MutableRefObject<T | undefined>['current'] {
	const ref = useRef<T>();
	useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}
