import { Currency } from '@keplr-wallet/types';
import { useStore } from 'src/stores';
import { getIbcBalances } from 'src/utils/ibc';

export function useIbcBalances(currencies: Currency[]) {
	const { chainStore, queriesStore, accountStore } = useStore();
	return getIbcBalances(currencies, chainStore, accountStore, queriesStore);
}
