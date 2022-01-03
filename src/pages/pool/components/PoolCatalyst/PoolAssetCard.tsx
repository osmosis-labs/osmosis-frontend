import styled from '@emotion/styled';
import React from 'react';
import { TokenIcon } from 'src/components/TokenIcons';
import { SubTitleText, Text, TitleText } from 'src/components/Texts';
import { colorPrimary } from 'src/emotionStyles/colors';

interface Props {
	iconPath: string | undefined;
	ratio: string;
	denom: string;
	totalAmount: string;
	myAmount: string;
	isMobileView: boolean;
}

export function PoolAssetCard({ iconPath, ratio, denom, totalAmount, myAmount, isMobileView }: Props) {
	return (
		<PoolAssetCardContainer>
			<PoolRatioSection>
				<AssetIcon src={iconPath} />

				<PoolRatioValue>
					<TitleText size="2xl" pb={isMobileView ? 2 : 8} isMobileView={isMobileView}>
						{ratio}%
					</TitleText>
					<Text size="sm" weight="semiBold">
						{denom}
					</Text>
				</PoolRatioValue>
			</PoolRatioSection>

			<AmountSection>
				<div style={{ marginBottom: 8 }}>
					<Text size="sm" weight="semiBold" pb={8}>
						Total amount
					</Text>
					<SubTitleText pb={0}>{totalAmount}</SubTitleText>
				</div>
				<div>
					<Text size="sm" weight="semiBold" pb={8}>
						My amount
					</Text>
					<SubTitleText pb={0}>{myAmount}</SubTitleText>
				</div>
			</AmountSection>
		</PoolAssetCardContainer>
	);
}

const PoolAssetCardContainer = styled.li`
	border-radius: 0.75rem;
	background-color: ${colorPrimary};
	padding: 20px;

	@media (min-width: 768px) {
		padding: 24px 30px;
	}
`;

const PoolRatioSection = styled.section`
	display: flex;
	margin-bottom: 16px;
`;

const AmountSection = styled.section`
	display: flex;
	flex-direction: column;
`;

const PoolRatioValue = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
`;

const AssetIcon = styled(TokenIcon)`
	height: 40px;
	width: 40px;
	margin: auto 20px auto 5px;

	@media (min-width: 768px) {
		height: 60px;
		width: 60px;
	}
`;
