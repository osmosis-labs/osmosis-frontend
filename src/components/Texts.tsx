import styled from '@emotion/styled';
import { colorSecondary } from 'src/emotionStyles/colors';
import { onLgWidth } from 'src/emotionStyles/mediaQueries';

export const TitleText = styled.h5`
	margin-bottom: 30px;
`;

export const SubTitleText = styled.h6`
	margin-bottom: 20px;
	font-weight: 400;
`;

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
