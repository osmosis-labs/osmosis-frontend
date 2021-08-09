import styled from '@emotion/styled';
import { colorWhiteHigh } from 'src/emotionStyles/colors';

export const AmountInput = styled.input`
	font-size: 24px;
	color: ${colorWhiteHigh};
	text-align: right;
	&::-webkit-outer-spin-button,
	&::-webkit-inner-spin-button {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		margin: 0;
	}
`;
