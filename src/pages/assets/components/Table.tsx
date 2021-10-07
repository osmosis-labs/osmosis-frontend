import styled from '@emotion/styled';
import { colorPrimary, colorWhiteRegular } from 'src/emotionStyles/colors';

export const TableHeaderRow = styled.tr`
	display: flex;
	align-items: center;
	width: 100%;
	padding-left: 20px;
	padding-right: 20px;
	border-bottom-width: 1px;
	background-color: ${colorPrimary};
	color: ${colorWhiteRegular};

	@media (min-width: 768px) {
		padding-left: 50px;
		padding-right: 60px;
		border-top-left-radius: 1rem;
		border-top-right-radius: 1rem;
	}
`;

export const TableRow = styled.tr`
	display: flex;
	width: 100%;
	height: 4.5rem;
	align-items: center;
	border-bottom-width: 1px;
	padding-left: 20px;
	padding-right: 20px;

	@media (min-width: 768px) {
		padding-left: 50px;
		padding-right: 60px;
	}
`;

const JUSTIFY_CONTENT_BY_ALIGN = {
	left: 'flex-start',
	center: 'center',
	right: 'flex-end',
} as const;

export const TableData = styled.td<{ align?: 'left' | 'center' | 'right' }>`
	display: flex;
	align-items: center;
	padding: 16px 8px;
	justify-content: ${({ align = 'left' }) => JUSTIFY_CONTENT_BY_ALIGN[align]};
`;
