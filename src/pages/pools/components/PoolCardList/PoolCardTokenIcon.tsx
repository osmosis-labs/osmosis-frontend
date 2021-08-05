import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { memoize } from 'lodash-es';
import React from 'react';
import { Img } from 'src/components/common/Img';

export function PoolCardTokenIcon({ poolId }: { poolId: string }) {
	return (
		<TokenIconBackground>
			<TokenIconContainer poolId={poolId}>
				<TokenIconImg src="/public/assets/Icons/OSMO.svg" />
			</TokenIconContainer>
		</TokenIconBackground>
	);
}

const TokenIconBackground = styled.figure`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 84px;
	height: 84px;
	border-radius: 9999px;
	border-width: 1px;
	border-color: rgba(196, 164, 106, 1);
	margin-right: 24px;
`;

const TokenIconContainer = styled.figure<{ poolId: string }>`
	width: 4.5rem;
	height: 4.5rem;
	border-radius: 9999px;
	display: flex;
	justify-content: center;
	align-items: center;
	${({ poolId }) => {
		return css`
			background-image: ${getLinearGradient(poolId)};
		`;
	}}
`;

const TokenIconImg = styled(Img)`
	width: 2.5rem;
	height: 2.5rem;
`;

const getLinearGradient = memoize((poolId: string) => {
	const LINEAR_GRADIENT_LIST = [
		`linear-gradient(180deg, #89eafb 0%, #1377b0 100%)`,
		`linear-gradient(180deg, #00CEBA 0%, #008A7D 100%)`,
		`linear-gradient(180deg, #6976FE 0%, #3339FF 100%)`,
		`linear-gradient(180deg, #0069C4 0%, #00396A 100%)`,
		`linear-gradient(180deg, #FF652D 0%, #FF0000 100%)`,
		`linear-gradient(180deg, #FFBC00 0%, #FF8E00 100%)`,
	];
	return LINEAR_GRADIENT_LIST[(Number(poolId) - 1 || 0) % LINEAR_GRADIENT_LIST.length];
});
