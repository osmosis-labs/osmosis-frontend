import React from 'react';
import styled from '@emotion/styled';
import { Img } from 'src/components/common/Img';

interface Props {
	svgUrls: (string | undefined)[];
}

export function TokenIcons({ svgUrls }: Props) {
	return (
		<Container>
			{svgUrls.map((url, index) => (
				<TokenIcon
					key={index}
					src={url}
					style={{ transform: `translate(-${index * 20}px, 0px)`, zIndex: 1000 - index }}
					loadingSpin={true}
				/>
			))}
		</Container>
	);
}

const Container = styled.div`
	padding: 5px;
	display: flex;
`;

export const TokenIcon = styled(Img)`
	height: 50px;
	width: 50px;
	margin: auto;
`;
