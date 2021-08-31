import moment from 'dayjs';
import React from 'react';

interface AirdropState {
	claimed: number;
	total: number;
	cliff: number;
}

const defaultState = {
	claimed: 153921200,
	total: 534345538,
	cliff: moment()
		.add(Math.random() * 96 + 48, 'hour')
		.valueOf(),
} as AirdropState;

export function useAirdropData() {
	// TODO : @Thunnini fetch data
	const [state, setState] = React.useState<AirdropState>(defaultState);

	return state;
}
