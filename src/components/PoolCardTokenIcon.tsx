import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { memoize } from 'lodash-es';
import React from 'react';

interface Props {
	/** random background linear gradient value set by index */
	bgIndex?: string | number;
	src: string;
}

export function PoolCardTokenIcon({ bgIndex, src }: Props) {
	return (
		<TokenIconBackground>
			<TokenIconContainer poolId={bgIndex}>
				<TokenIconImg src={src} />
			</TokenIconContainer>
		</TokenIconBackground>
	);
}

const TokenIconBackground = styled.figure`
	display: flex;
	flex-shrink: 0;
	justify-content: center;
	align-items: center;
	width: 4.75rem;
	height: 4.75rem;
	border-radius: 9999px;
	border-width: 1px;
	border-color: rgba(196, 164, 106, 1);
	margin-right: 20px;

	@media (min-width: 768px) {
		width: 5.25rem;
		height: 5.25rem;
		margin-right: 24px;
	}
`;

const TokenIconContainer = styled.figure<{ poolId?: string | number }>`
	width: 4rem;
	height: 4rem;
	border-radius: 9999px;
	display: flex;
	justify-content: center;
	align-items: center;
	${({ poolId }) => {
		return css`
			background-image: ${getLinearGradient(poolId)};
		`;
	}}

	@media (min-width: 768px) {
		width: 4.5rem;
		height: 4.5rem;
	}
`;

const TokenIconImg = styled.img`
	width: 2.5rem;
	height: 2.5rem;
`;

const getLinearGradient = memoize((poolId?: string | number) => {
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
