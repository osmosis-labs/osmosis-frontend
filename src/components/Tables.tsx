import styled from '@emotion/styled';
import { colorPrimary } from 'src/emotionStyles/colors';

const TableRowBaseStyled = styled.tr`
	display: flex;
	align-items: center;
	width: 100%;
	border-bottom-width: 1px;
	padding-left: 50px;
	padding-right: 60px;
`;

export const TableHeadRow = styled(TableRowBaseStyled)`
	background-color: ${colorPrimary};
	border-top-left-radius: 1rem;
	border-top-right-radius: 1rem;
	margin-top: 20px;
`;

export const TableBodyRow = styled(TableRowBaseStyled)`
	height: 76px;
`;

export const TableData = styled.td`
	display: flex;
	align-items: center;
	padding: 12px 8px;
`;
