import React, { FunctionComponent, ReactNode } from 'react';
import cn from 'clsx';
import times from 'lodash-es/times';
import map from 'lodash-es/map';
import keys from 'lodash-es/keys';
import each from 'lodash-es/each';
import capitalize from 'lodash-es/capitalize';
import { Img } from '../../components/common/Img';
import { formatNumber, applyOptionalDecimal } from '../../utils/format';
import { divide, multiply } from '../../utils/Big';
import { PointOptionsObject, SeriesPieOptions, TooltipOptions } from 'highcharts';
import cloneDeep from 'lodash-es/cloneDeep';
import { HIGHCHART_GRADIENTS, HIGHCHART_LEGEND_GRADIENTS, PieChart } from '../../components/common/PieChart';
import { useHistory } from 'react-router-dom';

const ROW_HEIGHT = 180;
export const GovernanceTab: FunctionComponent = () => {
	const governanceData: IProposalState[] = times(3, i => ({
		index: i + 10,
		title: 'Proposal to Increase OSMO incentives',
		details:
			'Proposal to Increase OSMO incentives Proposal to Increase OSMO incentives Proposal to Increase OSMO incentives',
		turnoutPercentage: 0.3568,
		totalVotes: 200,
		voteResults: {
			yes: 100,
			no: 50,
			noWithVeto: 25,
			abstain: 25,
		},
	}));
	return (
		<div className="w-full flex justify-center">
			<table style={{ maxWidth: '1280px' }} className="w-full h-full">
				<tbody className="w-full h-full">
					{map(governanceData, (data, i) => (
						<GovernanceRow key={i} data={data} height={180} />
					))}
				</tbody>
			</table>
		</div>
	);
};

export type TVote = 'yes' | 'no' | 'noWithVeto' | 'abstain';
interface IProposalState {
	index: number;
	title: string;
	details: string;
	turnoutPercentage: number;
	totalVotes: number;
	voteResults: Record<TVote, number>;
}

const GRAPH_GRADIENT_MAP = {
	yes: HIGHCHART_LEGEND_GRADIENTS[0],
	no: HIGHCHART_LEGEND_GRADIENTS[1],
	noWithVeto: HIGHCHART_LEGEND_GRADIENTS[2],
	abstain: HIGHCHART_LEGEND_GRADIENTS[3],
};

const GovernanceRow: FunctionComponent<{ data: IProposalState; height: number }> = ({ data, height }) => {
	const history = useHistory();
	const [series, setSeries] = React.useState<SeriesPieOptions[]>([]);

	React.useEffect(() => {
		setSeries(generateSeries(data));
	}, []);

	const mostVotedOn = React.useMemo(() => {
		let ret = '';
		let topValue = 0;
		each(keys(data.voteResults), key => {
			const aKey = key as TVote;
			if (data.voteResults[aKey] >= topValue) {
				topValue = data.voteResults[aKey];
				ret = key;
			}
		});
		return ret as TVote;
	}, [data.voteResults]);

	return (
		<tr style={{ height: `${height}px` }} className="w-full flex items-center border-b border-white-faint">
			<td style={{ width: '130px' }}>
				<figure style={{ height: '140px', width: '140px', marginLeft: '-10px' }}>
					<PieChart
						height={140}
						width={140}
						options={{
							series,
						}}
					/>
				</figure>
			</td>
			<td className="px-6" style={{ width: 'calc(100% - 130px - 86px)' }}>
				<div>
					<h6>
						#{data.index} {data.title}
					</h6>
					<div className="flex items-center gap-6 mt-3">
						<LabelValue label="Turnout">
							<p>{multiply(data.turnoutPercentage, 100, 2)}%</p>
						</LabelValue>
						<LabelValue label="Most voted on">
							<div className="flex items-center">
								<figure
									className="w-2 h-2 rounded-full mr-1.5"
									style={{ background: GRAPH_GRADIENT_MAP[mostVotedOn] }}
								/>
								<p>
									{capitalize(mostVotedOn)} {divide(data.voteResults[mostVotedOn], divide(data.totalVotes, 100), 2)}%
								</p>
							</div>
						</LabelValue>
					</div>
					<button
						onClick={() => history.push(`/governance/${data.index}`)}
						className="mt-4 flex items-center hover:opacity-75 cursor-pointer">
						<p className="text-secondary-200">Details</p>
						<Img src={'/public/assets/Icons/Right.svg'} />
					</button>
				</div>
			</td>
			<td className="flex h-full flex-col justify-end" style={{ width: '86px' }}>
				<button
					onClick={() => alert('Vote flow')}
					className="w-full hover:opacity-75 bg-primary-200 rounded-lg h-9 flex items-center justify-center mb-10">
					<p>Vote</p>
				</button>
			</td>
		</tr>
	);
};

const LabelValue: FunctionComponent<{ label: string }> = ({ label, children }) => {
	return (
		<div className="flex flex-col">
			<p className="text-white-emphasis mb-1">{label}</p>
			{children}
		</div>
	);
};

const pieSerie = {
	type: 'pie',
	slicedOffset: 10,
	allowPointSelect: false,
	cursor: 'pointer',
	dataLabels: {
		enabled: false,
	},
	innerSize: '65%',
	name: 'Pool',
	data: [] as PointOptionsObject[],
	borderWidth: 0,
	point: {
		events: {
			legendItemClick: function() {
				return false; // <== returning false will cancel the default action
			},
			// mouseOver: function() {
			// 	return false;
			// },
		},
	},
	tooltip: {
		pointFormatter: function() {
			return `<p>${this.x} / ${this.y}%</p>`;
		},
	} as TooltipOptions,
};
const series = [pieSerie];

const generateSeries = (data: IProposalState): SeriesPieOptions[] => {
	const serie = cloneDeep(pieSerie);
	const totalVotesDiv = divide(data.totalVotes, 100);
	serie.data.push({
		name: 'yes'.toUpperCase(),
		y: Number(divide(data.voteResults.yes, totalVotesDiv, 2)),
		x: Number(data.voteResults.yes),
		color: HIGHCHART_GRADIENTS[0],
	});
	serie.data.push({
		name: 'no'.toUpperCase(),
		y: Number(divide(data.voteResults.no, totalVotesDiv, 2)),
		x: Number(data.voteResults.no),
		color: HIGHCHART_GRADIENTS[1],
	});
	serie.data.push({
		name: 'noWithVeto'.toUpperCase(),
		y: Number(divide(data.voteResults.noWithVeto, totalVotesDiv, 2)),
		x: Number(data.voteResults.noWithVeto),
		color: HIGHCHART_GRADIENTS[2],
	});
	serie.data.push({
		name: 'abstain'.toUpperCase(),
		y: Number(divide(data.voteResults.abstain, totalVotesDiv, 2)),
		x: Number(data.voteResults.abstain),
		color: HIGHCHART_GRADIENTS[3],
	});
	return [serie as SeriesPieOptions];
};
