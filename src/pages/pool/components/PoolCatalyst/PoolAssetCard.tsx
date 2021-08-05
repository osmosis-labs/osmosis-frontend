import styled from '@emotion/styled';
import React from 'react';
import { PoolCardTokenIcon } from 'src/components/PoolCardTokenIcon';
import { colorPrimary } from 'src/emotionStyles/colors';

interface Props {
	index: number;
	ratio: string;
	denom: string;
	totalAmount: string;
	myAmount: string;
}

export function PoolAssetCard({ index, ratio, denom, totalAmount, myAmount }: Props) {
	return (
		<PoolAssetCardContainer>
			<PoolRatioSection>
				<PoolCardTokenIcon src="/public/assets/Icons/Bubbles.svg" bgIndex={index + 1} />

				<PoolRatioValue>
					<h4>{ratio}%</h4>
					<PoolCardSmallText style={{ marginTop: 8 }}>{denom}</PoolCardSmallText>
				</PoolRatioValue>
			</PoolRatioSection>

			<AmountSection>
				<div style={{ marginBottom: 8 }}>
					<PoolCardSmallText style={{ marginBottom: 8 }}>Total amount</PoolCardSmallText>
					<h6>{totalAmount}</h6>
				</div>
				<div>
					<PoolCardSmallText style={{ marginBottom: 8 }}>My amount</PoolCardSmallText>
					<h6>{myAmount}</h6>
				</div>
			</AmountSection>
		</PoolAssetCardContainer>
	);
}

const PoolAssetCardContainer = styled.li`
	border-radius: 0.75rem;
	background-color: ${colorPrimary};
	padding: 24px 30px;
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

const PoolCardSmallText = styled.p`
	font-size: 14px;
	color: rgba(255, 255, 255, 0.6);
	font-weight: 600;
`;
