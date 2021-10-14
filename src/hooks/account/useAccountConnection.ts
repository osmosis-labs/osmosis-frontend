import { useContext } from 'react';
import { AccountConnectionContext } from 'src/hooks/account/context';

export function useAccountConnection() {
	const context = useContext(AccountConnectionContext);
	if (!context) {
		throw new Error('You forgot to use AccountConnectionProvider');
	}
	return context;
}
