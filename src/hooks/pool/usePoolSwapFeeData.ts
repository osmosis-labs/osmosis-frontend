import { useQuery } from 'react-query';
import { getPoolSwapFeeData } from '../../remotes/pool/getPoolSwapFeeData';

const fiveMinsMS = 300000;

export function usePoolSwapFeeData(poolId: string) {
	return useQuery(['getPoolSwapFeeData', poolId], () => getPoolSwapFeeData(poolId), { staleTime: fiveMinsMS });
}
