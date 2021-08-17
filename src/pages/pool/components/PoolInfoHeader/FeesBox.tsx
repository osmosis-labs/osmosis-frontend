import styled from '@emotion/styled';
import { Dec, IntPretty } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CenterV } from 'src/components/layouts/Containers';
import { Text } from 'src/components/Texts';
import { colorPrimary, colorWhiteFaint } from 'src/emotionStyles/colors';
import { PoolSwapConfig } from './usePoolSwapConfig';

interface FeesBoxProps {
	config: PoolSwapConfig;
}

export const FeesBox = observer(function FeesBox({ config }: FeesBoxProps) {
	const outSpotPrice = config.spotPriceWithoutSwapFee;
	const inSpotPrice = outSpotPrice.toDec().equals(new Dec(0))
		? outSpotPrice
		: new IntPretty(new Dec(1).quo(outSpotPrice.toDec()));

	return (
		<FeeBoxContainer>
			<Section>
				<Text size="sm">Rate</Text>
				<Text size="sm">
					{`1 ${config.sendCurrency.coinDenom.toUpperCase()} = ${inSpotPrice
						.maxDecimals(3)
						.trim(true)
						.toString()} ${config.outCurrency.coinDenom.toUpperCase()}`}
				</Text>
			</Section>

			<InverseRateSection>
				<Text size="xs" emphasis="low">
					{`1 ${config.outCurrency.coinDenom.toUpperCase()} = ${outSpotPrice
						.maxDecimals(3)
						.trim(true)
						.toString()} ${config.sendCurrency.coinDenom.toUpperCase()}`}
				</Text>
			</InverseRateSection>

			<Section>
				<Text size="sm">Swap Fee</Text>
				<Text size="sm">{`${config.swapFee
					.trim(true)
					.maxDecimals(3)
					.toString()}%`}</Text>
			</Section>

			<hr style={{ width: '100%', marginTop: 15, marginBottom: 16 }} />

			<Section>
				<Text emphasis="high" size="sm" weight="semiBold">
					Estimated Slippage
				</Text>
				<Text emphasis="high" size="sm" weight="semiBold">
					{`${config.estimatedSlippage
						.trim(true)
						.maxDecimals(3)
						.toString()}%`}
				</Text>
			</Section>
		</FeeBoxContainer>
	);
});

const FeeBoxContainer = styled.div`
	width: 100%;
	border: 1px solid ${colorWhiteFaint};
	border-radius: 0.5rem;
	padding: 12px 18px;
	margin-bottom: 18px;
	background-color: ${colorPrimary};
`;

const Section = styled(CenterV)`
	justify-content: space-between;
`;

const InverseRateSection = styled(CenterV)`
	justify-content: flex-end;
	margin-top: 6px;
	margin-bottom: 10px;
`;
