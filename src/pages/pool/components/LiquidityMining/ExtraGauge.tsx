import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import { Int } from '@keplr-wallet/unit';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { SectionTitle, Text } from 'src/components/Texts';
import { colorPrimary } from 'src/emotionStyles/colors';
import { useStore } from 'src/stores';

interface Props {
	gaugeId: string;
	currency: AppCurrency;
	extraRewardAmount?: Int;
}

export const ExtraGauge = observer(function ExtraGauge({ gaugeId, currency, extraRewardAmount }: Props) {
	const { chainStore, queriesStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);

	const gauge = queries.osmosis.queryGauge.get(gaugeId);

	const reward = gauge.getCoin(currency).add(extraRewardAmount ?? new Int(0));

	if (!gauge.response) {
		return null;
	}

	return (
		<ExtraGaugeContainer>
			<SectionTitle>Bonus bonding reward</SectionTitle>
			<Text pb={16}>
				This pool bonding over {gauge.lockupDuration.humanize()} will earn additional bonding
				<br />
				incentives for {gauge.numEpochsPaidOver} epochs starting at {dayjs(gauge.startTime).format('MMM D, YYYY')}.
			</Text>
			<Text size="lg" color="secondary">
				{`Total Bonus: ${reward
					.maxDecimals(6)
					.trim(true)
					.toString()}`}
			</Text>
		</ExtraGaugeContainer>
	);
});

const ExtraGaugeContainer = styled.div`
	margin-top: 40px;
	padding: 28px 30px 40px;
	border-radius: 1rem;
	border-width: 1px;
	border-color: rgba(255, 255, 255, 0.6);
	background-color: ${colorPrimary};
`;
