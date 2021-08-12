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

export const cssRaiseButtonShadow = css`
	box-shadow: rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0.14) 0 4px 5px 0,
		rgba(0, 0, 0, 0.12) 0 1px 10px 0, rgba(0, 0, 0, 0.2) 0 2px 4px 0;
`;
