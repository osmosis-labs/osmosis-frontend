import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import { CoinPretty, Int } from '@keplr-wallet/unit';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { TitleText, Text } from 'src/components/Texts';
import { colorPrimary } from 'src/emotionStyles/colors';
import { useStore } from 'src/stores';

interface Props {
	/**
	 * The main gauge and other gauges with a shorter duration than the main gauge.
	 * The first gauge is treated as the main gauge.
	 */
	gaugeIds: string[];
	currency: AppCurrency;
	extraRewardAmount?: Int;
}

export const ExtraGauge = observer(function ExtraGauge({ gaugeIds, currency, extraRewardAmount }: Props) {
	const { chainStore, queriesStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);

	const gauges = useMemo(() => {
		let gauges = gaugeIds.map(gaugeId => queries.osmosis.queryGauge.get(gaugeId));

		if (gauges.length > 0) {
			const main = gauges[0];
			gauges = gauges.filter((gauge, i) => {
				if (i === 0) {
					return true;
				}

				return main.lockupDuration.asMilliseconds() > gauge.lockupDuration.asMilliseconds();
			});
		}

		return gauges;
	}, [gaugeIds]);

	const reward = gauges.reduce<CoinPretty>((prev, gauge) => {
		return prev.add(gauge.getCoin(currency));
	}, new CoinPretty(currency, extraRewardAmount ?? new Int(0)));

	if (gaugeIds.length === 0 || gauges.length === 0 || !gauges[0].response || gauges[0].remainingEpoch <= 0) {
		return null;
	}

	return (
		<ExtraGaugeContainer>
			<TitleText>Bonus bonding reward</TitleText>
			<Text pb={16}>
				{`This pool bonding over ${gauges[0].lockupDuration.humanize()} will earn additional bonding`}
				<br />
				{`incentives for ${gauges[0].remainingEpoch} epochs${
					dayjs(gauges[0].startTime).isAfter(Date.now())
						? ' starting at ' + dayjs(gauges[0].startTime).format('MMM D, YYYY')
						: ''
				}.`}
			</Text>
			<Text size="lg" color="gold">
				{`Total Bonus: ${reward
					.maxDecimals(0)
					.trim(true)
					.toString()}`}
			</Text>
		</ExtraGaugeContainer>
	);
});

const ExtraGaugeContainer = styled.div`
	flex: 1;
	margin-top: 40px;
	padding: 28px 30px 40px;
	border-radius: 1rem;
	border-width: 1px;
	border-color: rgba(255, 255, 255, 0.6);
	background-color: ${colorPrimary};
`;
