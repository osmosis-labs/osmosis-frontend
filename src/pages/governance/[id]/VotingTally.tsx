import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { IProposal } from './GovernanceDetailsPage';
import { HIGHCHART_GRADIENTS, HIGHCHART_LEGEND_GRADIENTS, PieChart } from '../../../components/common/PieChart';
import { TVote } from '../Governance';
import { PointOptionsObject, SeriesPieOptions } from 'highcharts';
import cloneDeep from 'lodash-es/cloneDeep';
import map from 'lodash-es/map';
import { add, divide, multiply, sumArray } from '../../../utils/Big';
import { mapKeyValues } from '../../../utils/scripts';
import { applyOptionalDecimal, formatNumber, toNormalCase } from '../../../utils/format';
import moment from 'dayjs';
import ReactLinkify from 'react-linkify';

export const VotingTally: FunctionComponent<{ proposal: IProposal }> = ({ proposal }) => {
	const series = React.useMemo(() => {
		return generateSeries(proposal.voteResults);
	}, [proposal.voteResults]);
	const total = React.useMemo(
		() =>
			sumArray(
				mapKeyValues(proposal.voteResults, (key: string, value: number) => value),
				0
			),
		[proposal.voteResults]
	);
	let i = 0; //	for gradients
	return (
		<div>
			<h5>Voting Tally</h5>
			<div style={{ height: '180px' }} className="mt-5 rounded-2xl bg-card py-2.5 pl-7.5 pr-10 w-fit flex items-center">
				<div className="mr-15" style={{ width: '160px', height: '160px' }}>
					<PieChart options={{ series }} width={160} height={160} />
				</div>
				<div className="py-0.5 h-full w-fit">
					<p className="mb-2">
						Total: {formatNumber(total)} OSMO ({applyOptionalDecimal(multiply(proposal.totalVotePercentage, 100, 1))}%)
					</p>
					<ul className="flex flex-col gap-1">
						{mapKeyValues(proposal.voteResults, (key: string, value: TVote) => {
							return (
								<li key={key} className="h-6 flex items-center">
									<figure
										className="rounded-full"
										style={{
											height: '15px',
											width: '15px',
											marginRight: '9.5px',
											background: HIGHCHART_LEGEND_GRADIENTS[i++],
										}}
									/>
									<p>{toNormalCase(key)}</p>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
			<div className="mt-10">
				<h5>Details</h5>
				<div className="mt-5 flex items-center gap-15">
					<DetailsLabelValue label="Deposit end time">
						<p className="font-medium">
							{moment(proposal.depositEndTime)
								.utc()
								.format('YYYY-MM-DD HH:mm UTC')}
						</p>
					</DetailsLabelValue>
					<DetailsLabelValue label="Voting start">
						<p className="font-medium">
							{moment(proposal.votingStart)
								.utc()
								.format('YYYY-MM-DD HH:mm UTC')}
						</p>
					</DetailsLabelValue>
					<DetailsLabelValue label="Voting end">
						<p className="font-medium">
							{moment(proposal.votingStart)
								.utc()
								.format('YYYY-MM-DD HH:mm UTC')}
						</p>
					</DetailsLabelValue>
				</div>
			</div>
			<div className="mt-5">
				<DetailsLabelValue label="Description">
					<p className="font-medium">
						<ReactLinkify>{proposal.description}</ReactLinkify>
					</p>
				</DetailsLabelValue>
			</div>
		</div>
	);
};

const DetailsLabelValue: FunctionComponent<{ label: string }> = ({ label, children }) => {
	return (
		<div className="flex flex-col">
			<p className="font-semibold text-white-mid">{label}</p>
			{children}
		</div>
	);
};

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

const generateSeries = (data: Record<TVote, number>): SeriesPieOptions[] => {
	const serie = cloneDeep(pieSerie);
	const totalDiv100 = divide(sumArray(mapKeyValues(data, (key: string, value: number) => value)), 100);
	Object.keys(data).forEach((key: string, i: number) => {
		const kkey = key as TVote;
		serie.data.push({
			name: key,
			y: Number(divide(data[kkey], totalDiv100, 2)),
			x: data[kkey],
			color: HIGHCHART_GRADIENTS?.[i] ? HIGHCHART_GRADIENTS?.[i] : undefined,
		});
	});
	return [serie as SeriesPieOptions];
};
