import axios from 'axios';
import { IMPERATOR_API_DOMAIN } from '../../constants/urls';

// https://api-osmosis.imperator.co/swagger/#/pools/fees_spent_pool_pools_v1_fees__pool_id__get

export interface PoolSwapFeeData {
	pool_id: number;

	/** All USD */
	volume_24h: number;
	volume_7d: number;
	fees_spent_24h: number;
	fees_spent_7d: number;

	fees_percentage: string;
}

export async function getPoolSwapFeeData(poolId: string) {
	const res = await axios.get<{ [data: string]: [PoolSwapFeeData] }>(`${IMPERATOR_API_DOMAIN}/pools/v1/fees/${poolId}`);
	return res.data;
}
