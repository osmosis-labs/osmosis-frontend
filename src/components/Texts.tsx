import styled from '@emotion/styled';
import React, { HTMLAttributes } from 'react';

const FontSizeBySize = {
	'2xl': 48,
	xl: 24,
	lg: 20,
	md: 16,
	sm: 12,
	xs: 10,
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
	white: `255, 255, 255`,
	secondary: `196, 164, 106`,
	/**TODO: add colors to be used in Texts */
};

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
	const textOpacity = color === 'secondary' ? 1 : OpacityByEmphasis[emphasis];
	return {
		...fontTypeProps,
		fontSize: FontSizeBySize[size as keyof typeof FontSizeBySize] ?? size,
		fontWeight: FontWeightByBoldness[weight],
		color: `rgba(${RgbByColor[color]}, ${textOpacity})`,
		paddingBottom: pb != null ? pb : undefined,
	};
}

export function SectionTitle({
	size = 'xl',
	pb = 16,
	emphasis = 'high',
	children,
	...props
}: OsmosisTextProps & HTMLAttributes<HTMLParagraphElement>) {
	return (
		<Text as="h4" size={size} pb={pb} emphasis={emphasis} {...props}>
			{children}
		</Text>
	);
}
