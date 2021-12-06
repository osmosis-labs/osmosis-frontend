import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import React, { ReactNode } from 'react';
import { CenterSelf, WellContainer } from 'src/components/layouts/Containers';
import { TitleText, Text } from 'src/components/Texts';
import { QueriedPoolBase } from 'src/stores/osmosis/query/pool';
import useWindowSize from 'src/hooks/useWindowSize';

interface Props {
	pool: QueriedPoolBase;
	lbpParams: NonNullable<QueriedPoolBase['smoothWeightChangeParams']>;
}

export const LbpCatalyst = observer(function LbpCatalyst({ pool, lbpParams }: Props) {
	const { isMobileView } = useWindowSize();

	return (
		<CenterSelf className="pb-10 pt-5 px-5 md:px-0">
			<TitleText isMobileView={isMobileView} pb={isMobileView ? 10 : 24}>
				LBP Stats
			</TitleText>
			<StatsContainer>
				<PoolWeightRow>
					<CellColumn
						head="Current Pool Weight"
						body={pool.poolRatios
							.map(ratio => {
								return (
									ratio.ratio
										.trim(true)
										.maxDecimals(2)
										.toString() + '%'
								);
							})
							.join(' : ')}
					/>
					<CellColumn
						head="Initial Pool Weight"
						body={lbpParams.initialPoolWeights
							.map(weight => {
								return (
									weight.ratio
										.trim(true)
										.maxDecimals(2)
										.toString() + '%'
								);
							})
							.join(' : ')}
					/>
					<CellColumn
						head="Target Pool Weight"
						body={lbpParams.targetPoolWeights
							.map(weight => {
								return (
									weight.ratio
										.trim(true)
										.maxDecimals(2)
										.toString() + '%'
								);
							})
							.join(' : ')}
					/>
				</PoolWeightRow>

				<DurationRow>
					<CellColumn
						head="Start Time"
						body={
							dayjs(lbpParams.startTime)
								.utc()
								.format('MMMM D, YYYY h:mm A') + ' UTC'
						}
					/>
					<CellColumn
						head="End Time"
						body={
							dayjs(lbpParams.endTime)
								.utc()
								.format('MMMM D, YYYY h:mm A') + ' UTC'
						}
					/>
				</DurationRow>
			</StatsContainer>
		</CenterSelf>
	);
});

const StatsContainer = styled.div`
	width: 100%;
	border-radius: 0.75rem;
	background-color: #2d2755;
	padding: 20px;
`;

const PoolWeightRow = styled.section`
	display: flex;
	gap: 20px;
	margin-bottom: 16px;

	@media (min-width: 768px) {
		margin-bottom: 20px;
		gap: 40px;
	}
`;

const DurationRow = styled.section`
	display: flex;
	gap: 20px;

	@media (min-width: 768px) {
		gap: 40px;
	}
`;

function CellColumn({ head, body }: { head: ReactNode; body: ReactNode }) {
	const { isMobileView } = useWindowSize();

	return (
		<div>
			<Text pb={4} isMobileView={isMobileView}>
				{head}
			</Text>
			<Text emphasis="high" isMobileView={isMobileView}>
				{body}
			</Text>
		</div>
	);
}
