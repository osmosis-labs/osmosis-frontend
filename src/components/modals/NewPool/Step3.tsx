import React, { FunctionComponent } from 'react';
import map from 'lodash-es/map';
import each from 'lodash-es/each';
import cloneDeep from 'lodash-es/cloneDeep';

import { IPools } from './Step1';
import { HIGHCHART_GRADIENTS, PieChart, HIGHCHART_LEGEND_GRADIENTS } from '../../common/PieChart';
import { GradientColorObject, PointOptionsObject, SeriesOptionsType, SeriesPieOptions } from 'highcharts';
import { TPool } from './index';
import { formatNumber } from '../../../utils/format';
import { fixed } from '../../../utils/Big';
import { TOKENS } from '../../../constants';

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
export const NewPoolStage3: FunctionComponent<IPools> = ({ poolState, setPoolState }) => {
	const [series, setSeries] = React.useState<SeriesPieOptions[]>([]);

	React.useEffect(() => {
		// TODO : take poolState and generate series
		setSeries(generateSeries(poolState.pools));
	}, []);

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
						{map(poolState.pools, (pool, i) => (
							<TokenRow key={i} data={pool} index={i} />
						))}
					</ul>
				</div>
			</div>
		</>
	);
};

const TokenRow: FunctionComponent<ITokenRow> = ({ data, index }) => {
	return (
		<li className="w-full flex items-center justify-between">
			<div className="h-full">
				<div className="flex items-center mb-1">
					<figure className="rounded-full w-4 h-4 mr-3" style={{ background: HIGHCHART_LEGEND_GRADIENTS[index] }} />
					<h6 className="font-normal">{data.token.toUpperCase()}</h6>
				</div>
				<p className="text-iconDefault">{data.channel}</p>
			</div>
			<div>
				<h6 className="mb-1 w-full text-right">{fixed(data.amount, TOKENS[data.token].DECIMALS)}</h6>
				<p className="text-white-emphasis w-full text-right">{fixed(data.ratio, 2)}%</p>
			</div>
		</li>
	);
};
interface ITokenRow {
	data: TPool;
	index: number;
}

const generateSeries = (data: TPool[]): SeriesPieOptions[] => {
	const serie = cloneDeep(pieSerie);
	each(data, (pool, i) => {
		serie.data.push({
			name: pool.token,
			y: Number(pool.ratio),
			x: Number(pool.amount),
			color: HIGHCHART_GRADIENTS?.[i] ? HIGHCHART_GRADIENTS?.[i] : undefined,
		});
	});
	return [serie as SeriesPieOptions];
};

// {
// 	name: 'Chrome',
// 		y: 61.41,
// 	label: '100123.21',
// },
