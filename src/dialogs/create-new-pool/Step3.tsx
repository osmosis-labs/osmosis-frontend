import React, { FunctionComponent, useMemo } from 'react';
import cloneDeep from 'lodash-es/cloneDeep';

import { HIGHCHART_GRADIENTS, PieChart, HIGHCHART_LEGEND_GRADIENTS } from '../../components/common/PieChart';
import { PointOptionsObject, SeriesPieOptions } from 'highcharts';
import { CreateNewPoolState } from './index';
import { observer } from 'mobx-react-lite';
import { AppCurrency } from '@keplr-wallet/types';

const pieSerie = {
	type: 'pie',
	allowPointSelect: true,
	cursor: 'pointer',
	dataLabels: {
		enabled: false,
	},
	innerSize: '70%',
	name: 'Pool',
	data: [] as PointOptionsObject[],
};
const series = [pieSerie];
export const NewPoolStage3: FunctionComponent<{
	state: CreateNewPoolState;
}> = observer(({ state }) => {
	const series = useMemo(() => {
		return generateSeries(state.assets);
	}, [state.assets]);

	return (
		<>
			<div className="pl-4.5">
				<h5 className="mb-4.5">Create New Pool</h5>
				<div className="inline w-full flex items-center">
					<p className="text-sm mr-2.5">Step 3/3 - Confirm Pool Ratio and Token Amount</p>
					<div className="inline-block rounded-full w-3.5 h-3.5 text-xs bg-secondary-200 flex items-center justify-center text-black">
						!
					</div>
				</div>
			</div>
			<div className="mt-4 flex items-center justify-between mb-10">
				<figure style={{ height: '200px', width: '200px' }}>
					<PieChart
						options={{
							series,
						}}
					/>
				</figure>
				<div className="flex flex-col w-full ml-9">
					<div className="flex justify-between items-center">
						<p className="text-xs text-white-disabled">Token</p>
						<p className="text-xs text-white-disabled">Amount</p>
					</div>
					<ul className="pt-3 flex flex-col gap-4">
						{state.assets.map((asset, i) => {
							return (
								<TokenRow
									key={asset.currency.coinMinimalDenom}
									index={i}
									currency={asset.currency}
									amount={asset.amount}
									percentage={asset.percentage}
								/>
							);
						})}
					</ul>
				</div>
			</div>
		</>
	);
});

const TokenRow: FunctionComponent<{
	index: number;
	currency: AppCurrency;
	amount: string;
	percentage: string;
}> = observer(({ index, currency, amount, percentage }) => {
	// 만약 IBC Currency일 경우 실제 coinDenom을 무시하고 원래 currency의 coinDenom을 표시한다.
	const coinDenom =
		'originCurrency' in currency && currency.originCurrency ? currency.originCurrency.coinDenom : currency.coinDenom;
	// 만약 IBC Currency일 경우 첫번째 path의 채널 ID를 보여준다.
	const channel = 'paths' in currency && currency.paths.length > 0 ? currency.paths[0].channelId : '';

	return (
		<li className="w-full flex items-center justify-between">
			<div className="h-full">
				<div className="flex items-center mb-1">
					<figure className="rounded-full w-4 h-4 mr-3" style={{ background: HIGHCHART_LEGEND_GRADIENTS[index] }} />
					<h6 className="font-normal">{coinDenom.toUpperCase()}</h6>
				</div>
				{channel ? <p className="text-iconDefault">{channel}</p> : null}
			</div>
			<div>
				<h6 className="mb-1 w-full text-right">{amount}</h6>
				<p className="text-white-emphasis w-full text-right">{percentage}%</p>
			</div>
		</li>
	);
});

const generateSeries = (data: { currency: AppCurrency; percentage: string; amount: string }[]): SeriesPieOptions[] => {
	const serie = cloneDeep(pieSerie);
	data.forEach((d, i) => {
		serie.data.push({
			name: d.currency.coinDenom.toUpperCase(),
			y: Number(d.percentage),
			x: Number(d.amount),
			color: HIGHCHART_GRADIENTS?.[i] ? HIGHCHART_GRADIENTS?.[i] : undefined,
		});
	});
	return [serie as SeriesPieOptions];
};
