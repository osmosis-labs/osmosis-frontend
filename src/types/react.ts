import { useState, Dispatch, SetStateAction } from 'react';

// wrapper for the return type of useState https://stackoverflow.com/a/64840774/1633985
interface wrappedUseState<S> {
	(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
}
/** example: const [a, setA]: StateRef<string> = useState<string>() */
export type StateRef<T> = ReturnType<wrappedUseState<T>>;
