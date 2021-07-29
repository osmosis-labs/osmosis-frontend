import styled from '@emotion/styled';
import { colorWhiteHigh } from '../../emotionStyles/colors';
import { fontXl } from '../../emotionStyles/fonts';

export const AmountInput = styled.input`
	font-size: ${fontXl}px;
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
