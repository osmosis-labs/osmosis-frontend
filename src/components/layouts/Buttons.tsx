import styled from '@emotion/styled';
import { colorPrimary200 } from 'src/emotionStyles/colors';

export const ButtonPrimary = styled.button`
	padding: 10px 16px;
	border-radius: 0.5rem;
	background-color: ${colorPrimary200};
	cursor: pointer;
	line-height: 1;

	&:hover {
		opacity: 0.75;
	}
`;
