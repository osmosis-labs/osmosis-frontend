import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import { Dec, IntPretty, RatePretty } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React, { HTMLAttributes } from 'react';
import { CenterV } from 'src/components/layouts/Containers';
import { Text } from 'src/components/Texts';
import { colorError, colorPrimary, colorWhiteFaint } from 'src/emotionStyles/colors';
import useWindowSize from 'src/hooks/useWindowSize';

interface BaseConfig {
	spotPriceWithoutSwapFee: IntPretty;
	sendCurrency: AppCurrency;
	outCurrency: AppCurrency;
	estimatedSlippage: IntPretty;
}

interface PoolSwapConfig extends BaseConfig {
	swapFee: IntPretty;
}

interface TradeSwapConfig extends BaseConfig {
	swapFees: IntPretty[];
	showWarningOfSlippage: boolean;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
	config: PoolSwapConfig | TradeSwapConfig;
}

export const FeesBox = observer(function FeesBox({ config, ...props }: Props) {
	const outSpotPrice = config.spotPriceWithoutSwapFee;
	const inSpotPrice = outSpotPrice.toDec().equals(new Dec(0))
		? outSpotPrice
		: new IntPretty(new Dec(1).quo(outSpotPrice.toDec()));

	const swapFeeText = isPoolSwapConfig(config)
		? `${config.swapFee
				.trim(true)
				.maxDecimals(3)
				.toString()}%`
		: config.swapFees
				.map(swapFee => {
					return `${swapFee
						.trim(true)
						.maxDecimals(3)
						.toString()}%`;
				})
				.join(' + ');

	const { isMobileView } = useWindowSize();

	return (
		<FeeBoxContainer {...props}>
			<Section>
				<Text size="sm" isMobileView={isMobileView}>
					Rate
				</Text>
				<Text size="sm" isMobileView={isMobileView}>
					{`1 ${config.sendCurrency.coinDenom.toUpperCase()} = ${inSpotPrice
						.maxDecimals(3)
						.trim(true)
						.toString()} ${config.outCurrency.coinDenom.toUpperCase()}`}
				</Text>
			</Section>

			<InverseRateSection>
				<Text size="xs" isMobileView={isMobileView} emphasis="low">
					{`1 ${config.outCurrency.coinDenom.toUpperCase()} = ${outSpotPrice
						.maxDecimals(3)
						.trim(true)
						.toString()} ${config.sendCurrency.coinDenom.toUpperCase()}`}
				</Text>
			</InverseRateSection>

			<Section>
				<Text size="sm" isMobileView={isMobileView}>
					Swap Fee
				</Text>
				<Text size="sm" isMobileView={isMobileView}>
					{swapFeeText}
				</Text>
			</Section>

			<hr style={{ width: '100%', marginTop: isMobileView ? 12 : 15, marginBottom: isMobileView ? 12 : 16 }} />

			<Section>
				<Text isMobileView={isMobileView} emphasis="high" size="sm" weight="semiBold">
					Estimated Slippage
				</Text>
				<Text
					isMobileView={isMobileView}
					emphasis="high"
					size="sm"
					weight="semiBold"
					style={!isPoolSwapConfig(config) && config.showWarningOfSlippage ? { color: colorError } : undefined}>
					{new RatePretty(config.estimatedSlippage).moveDecimalPointLeft(2).toString()}
				</Text>
			</Section>
		</FeeBoxContainer>
	);
});

export const FeeBoxContainer = styled.div`
	width: 100%;
	border: 1px solid ${colorWhiteFaint};
	border-radius: 0.5rem;
	padding: 12px;
	margin-bottom: 18px;
	background-color: ${colorPrimary};

	@media (min-width: 768px) {
		padding: 12px 18px;
	}
`;

const Section = styled(CenterV)`
	justify-content: space-between;
`;

const InverseRateSection = styled(CenterV)`
	justify-content: flex-end;
	margin-top: 6px;
	margin-bottom: 10px;
`;

function isPoolSwapConfig(config: PoolSwapConfig | TradeSwapConfig): config is PoolSwapConfig {
	return 'swapFee' in config && config.swapFee != null;
}
