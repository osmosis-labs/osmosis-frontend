import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CenterSelf, WellContainer } from 'src/components/layouts/Containers';
import { SectionTitleText, Text } from 'src/components/Texts';
import { QueriedPoolBase } from 'src/stores/osmosis/query/pool';

interface Props {
	pool: QueriedPoolBase;
	lbpParams: NonNullable<QueriedPoolBase['smoothWeightChangeParams']>;
}

export const LbpCatalyst = observer(function LbpCatalyst({ pool, lbpParams }: Props) {
	return (
		<CenterSelf style={{ paddingBottom: 40 }}>
			<SectionTitleText>LBP Stats</SectionTitleText>
			<WellContainer>
				<PoolWeightRow>
					<Column>
						<CellHead>Current Pool Weight</CellHead>
						<CellBody>
							{pool.poolRatios
								.map(ratio => {
									return (
										ratio.ratio
											.trim(true)
											.maxDecimals(2)
											.toString() + '%'
									);
								})
								.join(' : ')}
						</CellBody>
					</Column>
					<Column>
						<CellHead>Initial Pool Weight</CellHead>
						<CellBody>
							{lbpParams.initialPoolWeights
								.map(weight => {
									return (
										weight.ratio
											.trim(true)
											.maxDecimals(2)
											.toString() + '%'
									);
								})
								.join(' : ')}
						</CellBody>
					</Column>
					<Column>
						<CellHead>Target Pool Weight</CellHead>
						<CellBody>
							{lbpParams.targetPoolWeights
								.map(weight => {
									return (
										weight.ratio
											.trim(true)
											.maxDecimals(2)
											.toString() + '%'
									);
								})
								.join(' : ')}
						</CellBody>
					</Column>
				</PoolWeightRow>

				<DurationRow>
					<Column>
						<CellHead>Start Time</CellHead>
						<CellBody>
							{dayjs(lbpParams.startTime)
								.utc()
								.format('MMMM D, YYYY h:mm A') + ' UTC'}
						</CellBody>
					</Column>
					<Column>
						<CellHead>End Time</CellHead>
						<CellBody>
							{dayjs(lbpParams.endTime)
								.utc()
								.format('MMMM D, YYYY h:mm A') + ' UTC'}
						</CellBody>
					</Column>
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

const Column = styled.div`
	margin-right: 40px;
`;

const CellHead = styled(Text)`
	margin-bottom: 4px;
`;

const CellBody = styled(Text)``;
CellBody.defaultProps = { emphasis: 'high' };
