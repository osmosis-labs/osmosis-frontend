import styled from '@emotion/styled';
import React, { SVGAttributes } from 'react';

interface Props extends SVGAttributes<SVGSVGElement> {
	size?: number;
}

export function LinkIcon({ size = 15, ...props }: Props) {
	return (
		<LinkIconSvg width={size} height={size} viewBox={`0 0 ${size} ${size}`} {...props}>
			<path
				fill="currentColor"
				d="M13.588.794a.598.598 0 00-.066.006H10A.6.6 0 1010 2h2.152L5.976 8.176a.6.6 0 10.848.848L13 2.848V5a.601.601 0 001.157.232A.6.6 0 0014.2 5V1.476a.598.598 0 00-.612-.682zM1.6 3.2C.944 3.2.4 3.744.4 4.4v9c0 .656.544 1.2 1.2 1.2h9c.656 0 1.2-.544 1.2-1.2V5.853l-1.2 1.2V13.4h-9v-9H7.947l1.2-1.2H1.6z"
			/>
		</LinkIconSvg>
	);
}

const LinkIconSvg = styled.svg`
	fill: currentColor;
`;

LinkIconSvg.defaultProps = { xmlns: 'http://www.w3.org/2000/svg' };
