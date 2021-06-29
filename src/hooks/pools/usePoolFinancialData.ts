import { useQuery } from 'react-query';
import { getPoolFinancialData } from '../../remotes/pools/getPoolFinancialData';

export function usePoolFinancialData() {
	return useQuery(['poolFinancialData'], getPoolFinancialData);
}
