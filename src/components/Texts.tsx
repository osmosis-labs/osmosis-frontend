import styled from '@emotion/styled';
import React from 'react';

const FontSizeBySize = {
	'2xl': 36,
	xl: 24,
	lg: 20,
	md: 16,
	sm: 14,
	xs: 12,
};

const OpacityByEmphasis = {
	high: 0.95,
	medium: 0.87,
	regular: 0.6,
	low: 0.38,
	/**flat/dead/disabled?: 0.12*/
};

const FontWeightByBoldness = {
	bold: 700,
	semiBold: 600,
	medium: 500,
	regular: 400,
	light: 300,
} as const;

const RgbByColor = {
	primary: `138, 134, 255`,
	white: `255, 255, 255`,
	gold: `196, 164, 106`,
	green: `52, 239, 82`,
	red: `239, 52, 86`,
	black: `0, 0, 0`,
	/**TODO: add colors to be used in Texts */
};

const solidColorList = ['gold', 'primary', 'black', 'green', 'red'];

interface OsmosisTextProps {
	size?: keyof typeof FontSizeBySize | number | string;
	weight?: keyof typeof FontWeightByBoldness;
	emphasis?: keyof typeof OpacityByEmphasis;
	color?: keyof typeof RgbByColor;
	fontType?: 'Inter' | 'Poppins';
	pb?: number;
}

export const Text = styled.p<OsmosisTextProps>`
	${mapTextPropsToCssProps};
`;

function mapTextPropsToCssProps({
	size = 'md',
	weight = 'regular',
	emphasis = 'regular',
	color = 'white',
	fontType,
	pb,
}: OsmosisTextProps) {
	const fontTypeProps = ['2xl', 'xl', 'lg'].some(largeSize => size === largeSize)
		? { lineHeight: 1, fontFamily: `${fontType ?? 'Poppins'}, ui-sans-serif, system-ui` }
		: { lineHeight: undefined, fontFamily: `${fontType ?? 'Inter'}, ui-sans-serif, system-ui` };
	const textOpacity = solidColorList.some(solidColor => solidColor === color) ? 1 : OpacityByEmphasis[emphasis];
	return {
		...fontTypeProps,
		fontSize: FontSizeBySize[size as keyof typeof FontSizeBySize] ?? size,
		fontWeight: FontWeightByBoldness[weight],
		color: `rgba(${RgbByColor[color]}, ${textOpacity})`,
		paddingBottom: pb != null ? pb : undefined,
	};
}

export const TitleText = styled(Text)``;
TitleText.defaultProps = {
	size: 'xl',
	emphasis: 'high',
	weight: 'semiBold',
	pb: 16,
	as: 'h4',
};

export const SubTitleText = styled(Text)``;
SubTitleText.defaultProps = {
	size: 'lg',
	emphasis: 'high',
	weight: 'semiBold',
	pb: 4,
	as: 'h6',
};
