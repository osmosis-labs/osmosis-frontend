import { css } from '@emotion/react';

export const cssKeyFramesSpin = css`
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
`;

export const cssAnimateSpin = ({ duration = 1000 }: { duration?: number } = {}) => css`
	${cssKeyFramesSpin};
	animation: spin ${duration}ms linear infinite;
`;
