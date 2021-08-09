import styled from '@emotion/styled';
import { colorSecondary } from 'src/emotionStyles/colors';
import { onLgWidth } from 'src/emotionStyles/mediaQueries';

const FontSizeBySize = {
	'2xl': 48,
	xl: 36,
	lg: 24,
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
	/**TODO: add colors to be used in Texts */
};

interface OsmosisTextProps {
	size?: keyof typeof FontSizeBySize | number | string;
	weight?: keyof typeof FontWeightByBoldness;
	emphasis?: keyof typeof OpacityByEmphasis;
	color?: keyof typeof RgbByColor;
	type?: 'Inter' | 'Poppins';
}

export const Text = styled.p<OsmosisTextProps>`
	${mapTextPropsToCssProps};
`;

function mapTextPropsToCssProps({
	size = 'md',
	weight = 'regular',
	emphasis = 'regular',
	color = 'white',
	type = 'Inter',
}: OsmosisTextProps) {
	return {
		fontFamily: `${type}, ui-sans-serif, system-ui`,
		fontSize: FontSizeBySize[size as keyof typeof FontSizeBySize] ?? size,
		fontWeight: FontWeightByBoldness[weight],
		color: `rgba(${RgbByColor[color]}, ${OpacityByEmphasis[emphasis]})`,
	};
}

export const SectionTitleText = styled.h5`
	line-height: 1;
	margin-bottom: 30px;
	font-size: 24px;
	font-weight: 600;
	font-family: Poppins, ui-sans-serif, system-ui;
	color: rgba(255, 255, 255, 0.95);
`;

export const SubTitleText = styled.h6`
	margin-bottom: 20px;
	font-weight: 400;
`;

/** Paragraph */
export const MediumTextWhite = styled.p`
	color: rgba(255, 255, 255, 0.6);
	font-weight: 500;
`;

export const H4 = styled.h4`
	font-weight: 400;
	font-size: 24px;

	${onLgWidth} {
		font-size: 36px;
	}

	margin-bottom: 16px;
`;

export const H6Secondary = styled.h6`
	font-weight: 400;
	color: ${colorSecondary};
`;
