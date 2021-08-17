import styled from '@emotion/styled';
import { colorPrimaryDark } from 'src/emotionStyles/colors';

export const TokenBoxContainer = styled.div`
	position: relative;
	border-radius: 1rem;
	padding: 16px 20px 8px 16px;
	background-color: ${colorPrimaryDark};
`;

export const TokenBoxRow = styled.section`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
`;
