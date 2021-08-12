import { css } from '@emotion/react';

export const cssAlignRightInput = css`
	text-align: right;
	::placeholder {
		text-align: right;
	}
`;

export const cssNumberTextInput = css`
	&::-webkit-outer-spin-button,
	&::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	&[type='number'] {
		-moz-appearance: textfield;
	}
`;
