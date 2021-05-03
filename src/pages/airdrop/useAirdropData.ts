import React from 'react';

import moment from 'dayjs';

const defaultState = {
	claimed: 153921200,
	total: 534345538,
	cliff: moment()
		.add(Math.random() * 96 + 48, 'hour')
		.valueOf(),
} as TAirdopState;

export const useAirdropData: () => TAirdopState = () => {
	// TODO : @Thunnini fetch data
	const [state, setState] = React.useState<TAirdopState>(defaultState);

	return state;
};

export interface TAirdopState {
	claimed: number;
	total: number;
	cliff: number;
}
