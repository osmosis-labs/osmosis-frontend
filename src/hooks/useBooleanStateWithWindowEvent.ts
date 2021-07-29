import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
	/** @default: click */
	windowEventName?: string;
	/** @description: return next boolean state.
	 * @default: toggles boolean state on windowEvent
	 * */
	onWindowEvent?: (prevBool?: boolean) => boolean;
}

export function useBooleanStateWithWindowEvent(
	defaultBool: boolean,
	{ windowEventName = 'click', onWindowEvent }: Options = {}
) {
	const listenerRef = useRef<Options['onWindowEvent'] | null>(onWindowEvent ?? null);

	const [bool, setBool] = useState<boolean>(defaultBool);

	const windowListener = useCallback(() => {
		setBool(prevBool => listenerRef.current?.(prevBool) ?? !prevBool);
	}, []);

	useEffect(() => {
		if (bool) {
			window.addEventListener(windowEventName, windowListener);
		} else {
			window.removeEventListener(windowEventName, windowListener);
		}
		return () => {
			window.removeEventListener(windowEventName, windowListener);
		};
	}, [bool, windowEventName, windowListener]);

	return [bool, setBool] as const;
}
