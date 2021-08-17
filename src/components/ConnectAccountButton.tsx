import styled from '@emotion/styled';
import * as React from 'react';
import { Text } from 'src/components/Texts';
import { colorPrimary200 } from 'src/emotionStyles/colors';
import { Img } from './common/Img';

export function ConnectAccountButton(props: React.HTMLAttributes<HTMLButtonElement>) {
	return (
		<ConnectAccountButtonWrapper {...props}>
			<WalletImg src="/public/assets/Icons/Wallet.svg" />
			<Text size="sm" emphasis="high" weight="semiBold" style={{ maxWidth: '105px', marginLeft: '12px' }}>
				Connect Wallet
			</Text>
		</ConnectAccountButtonWrapper>
	);
}

const ConnectAccountButtonWrapper = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 32px;
	width: 100%;
	padding: 8px 4px;
	border-radius: 0.375rem;
	background-color: ${colorPrimary200};
`;

const WalletImg = styled(Img)`
	width: 1.25rem;
	height: 1.25rem;
`;
