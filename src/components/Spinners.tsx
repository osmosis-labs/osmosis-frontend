import styled from '@emotion/styled';
import React from 'react';

interface Props {
	size?: number;
}

export function Spinner({ size = 24 }: Props) {
	return (
		<SpinnerSvg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`}>
			<circle cx="12" cy="12" r="10" />
			<path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
		</SpinnerSvg>
	);
}

const SpinnerSvg = styled.svg`
	animation: spin 1s linear infinite;
	margin-left: -4px;
	margin-right: 12px;
	height: 1.25rem;
	width: 1.25rem;
	fill: none;

	& > circle {
		opacity: 0.25;
		stroke-width: 4;
		stroke: currentColor;
	}

	& > path {
		fill: currentColor;
		opacity: 0.75;
	}
`;
