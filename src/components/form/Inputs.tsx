import styled from '@emotion/styled';
import { colorWhiteHigh } from 'src/emotionStyles/colors';

export const AmountInput = styled.input`
	font-size: 16px;
	color: ${colorWhiteHigh};
	text-align: right;
	&::-webkit-outer-spin-button,
	&::-webkit-inner-spin-button {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		margin: 0;
	}
	width: 100%;
	padding-right: 42px;

	@media (min-width: 768px) {
		font-size: 24px;
		padding-right: 0;
	}
`;
