import styled from '@emotion/styled';
import clsx from 'clsx';
import React, { SVGAttributes } from 'react';
import { cssAnimateSpin } from 'src/emotionStyles/animations';
import { colorWhiteHigh } from 'src/emotionStyles/colors';

interface Props extends SVGAttributes<SVGSVGElement> {
	size?: number;
}

export function Spinner({ size = 24, ...props }: Props) {
	return (
		<SpinnerSvg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`} {...props}>
			<circle cx="12" cy="12" r="10" />
			<path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
		</SpinnerSvg>
	);
}

export function OsmosisSpinner({ className = undefined }: { className?: string }) {
	return (
		<img
			alt="logo"
			className={clsx('s-spin w-5 h-5 md:w-10 md:h-10 mb-4', className)}
			src={'/public/assets/main/logo-single.png'}
		/>
	);
}

const SpinnerSvg = styled.svg`
	${cssAnimateSpin()};
	height: 1.25rem;
	width: 1.25rem;
	fill: none;
	color: ${colorWhiteHigh};

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
