import styled from '@emotion/styled';
import { colorPrimary } from 'src/emotionStyles/colors';
import { onLgWidth, on2XlWidth } from 'src/emotionStyles/mediaQueries';

export const FullScreenContainer = styled.div`
	width: 100%;
	height: 100%;
`;

export const FullWidthContainer = styled.div`
	width: 100%;
	max-width: 1920px;
`;

export const CenterSection = styled.section`
	display: flex;
	justify-content: center;
	align-items: flex-start;
	padding: 40px;
`;

export const CenterV = styled.div`
	display: flex;
	align-items: center;
`;

export const CenterH = styled.div`
	display: flex;
	justify-content: center;
`;

export const Center = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

export const CenterSelf = styled.div`
	max-width: 1920px;
	margin-left: auto;
	margin-right: auto;
`;

export const PoolCardListGridContainer = styled.ul`
	display: grid;
	width: 100%;
	height: 100%;
	gap: 16px;
	grid-template-columns: repeat(1, minmax(0, 1fr));

	${onLgWidth} {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 35px;
	}

	${on2XlWidth} {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 35px;
	}
`;

export const WellContainer = styled.div`
	width: 100%;
	border-radius: 0.75rem;
	background-color: ${colorPrimary};
	padding: 24px 30px;
`;
