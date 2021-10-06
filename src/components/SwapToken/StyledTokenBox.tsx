import styled from '@emotion/styled';
import { colorPrimaryDark } from 'src/emotionStyles/colors';

export const TokenBoxContainer = styled.div`
	position: relative;
	border-radius: 0.75rem;
	padding: 12px 12px 6px 12px;
	background-color: ${colorPrimaryDark};

	@media (min-width: 768px) {
		border-radius: 1rem;
		padding: 16px 20px 8px 16px;
	}
`;

export const TokenBoxRow = styled.section`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
`;
