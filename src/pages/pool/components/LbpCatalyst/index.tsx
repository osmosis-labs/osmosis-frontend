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
		<CenterSelf style={{ paddingBottom: 40 }}>
			<TitleText isMobileView={isMobileView} pb={isMobileView ? 10 : 24}>
				LBP Stats
			</TitleText>
			<WellContainer>
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
			</WellContainer>
		</CenterSelf>
	);
});

const PoolWeightRow = styled.section`
	display: flex;
	margin-bottom: 20px;
`;

const DurationRow = styled.section`
	display: flex;
`;

function CellColumn({ head, body }: { head: ReactNode; body: ReactNode }) {
	return (
		<CellColumnWrapper>
			<Text pb={4}>{head}</Text>
			<Text emphasis="high">{body}</Text>
		</CellColumnWrapper>
	);
}

const CellColumnWrapper = styled.div`
	margin-right: 40px;
`;
