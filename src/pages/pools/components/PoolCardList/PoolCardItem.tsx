import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React, { HTMLAttributes } from 'react';
import { CenterV } from 'src/components/layouts/Containers';
import { PoolCardTokenIcon } from 'src/components/PoolCardTokenIcon';
import { isMyPoolCardProp } from 'src/pages/pools/components/PoolCardList/utils/isMyPoolCardProp';
import { IncentivizedPoolCardProp, MyPoolCardProp } from 'src/pages/pools/models/poolCardProps';
import { Optional } from 'utility-types';

export function PoolCardItem(
	props: (IncentivizedPoolCardProp | Optional<MyPoolCardProp, 'myLiquidity'>) & {
		onClick: HTMLAttributes<HTMLLIElement>['onClick'];
	}
) {
	const { poolId, tokens, liquidity, apr, onClick } = props;

	return (
		<PoolCardItemContainer onClick={onClick}>
			<TokenInfoContainer>
				<PoolCardTokenIcon bgIndex={poolId} src="/public/assets/Icons/OSMO.svg" />
				<div style={{ marginTop: '15px' }}>
					<h5>Pool #{poolId}</h5>
					<PoolSubTitle>
						{tokens
							.map(token => {
								// IBC Currency라도 원래의 coin denom을 보여준다.
								return 'originCurrency' in token && token.originCurrency
									? token.originCurrency.coinDenom.toUpperCase()
									: token.coinDenom.toUpperCase();
							})
							.join('/')}
					</PoolSubTitle>
				</div>
			</TokenInfoContainer>

			{isMyPoolCardProp(props) ? (
				<>
					<CenterV as="section">
						<div>
							<PoolHeaderText>Pool Liquidity</PoolHeaderText>
							<PoolValueText>{liquidity}</PoolValueText>
						</div>
						{apr && (
							<div style={{ marginLeft: '20px' }}>
								<PoolHeaderText>APR</PoolHeaderText>
								<PoolValueText>{apr}%</PoolValueText>
							</div>
						)}
					</CenterV>

					<Hr apr={apr} myLockedAmount={props.myLockedAmount} />

					<CenterV>
						<div>
							<PoolHeaderText>My Liquidity</PoolHeaderText>
							<PoolValueText>{props.myLiquidity}</PoolValueText>
						</div>
						{props.myLockedAmount && (
							<div style={{ marginLeft: '20px' }}>
								<PoolHeaderText>My Bonded Amount</PoolHeaderText>
								<PoolValueText>{props.myLockedAmount}</PoolValueText>
							</div>
						)}
					</CenterV>
				</>
			) : (
				<CenterV>
					<AprCol>
						<PoolHeaderText>APR</PoolHeaderText>
						<PoolValueText>{apr}%</PoolValueText>
					</AprCol>
					<div style={{ marginLeft: '20px' }}>
						<PoolHeaderText>Pool Liquidity</PoolHeaderText>
						<PoolValueText>{liquidity}</PoolValueText>
					</div>
				</CenterV>
			)}
		</PoolCardItemContainer>
	);
}

const PoolCardItemContainer = styled.li`
	border-width: 1px;
	cursor: pointer;
	padding: 20px;
	background-color: rgba(45, 39, 85, 1);
	border-radius: 0.75rem;
	border-color: transparent;

	&:hover {
		border-color: rgba(196, 164, 106, 1);
	}

	@media (min-width: 768px) {
		padding: 24px 30px;
	}
`;

const TokenInfoContainer = styled.section`
	display: flex;
	margin-bottom: 16px;
`;

const PoolTextBase = styled.p`
	font-size: 14px;
	color: rgba(255, 255, 255, 0.6);
	word-break: break-all;
`;

const PoolSubTitle = styled(PoolTextBase)`
	font-weight: 600;
	margin-top: 8px;
`;

const PoolHeaderText = styled(PoolTextBase)`
	margin-bottom: 8px;
`;

const PoolValueText = styled.h6`
	color: rgba(255, 255, 255, 0.87);
`;

const Hr = styled.div<{ apr?: string; myLockedAmount?: string }>`
	border-bottom-width: 1px;
	border-color: rgba(196, 164, 106, 1);
	margin-top: 16px;
	margin-bottom: 16px;
	${({ apr, myLockedAmount }) =>
		css`
			max-width: ${apr || myLockedAmount ? '15.5rem' : '6.5rem'};
		`}
`;

const AprCol = styled.div`
	border-right-width: 1px;
	border-color: rgba(196, 164, 106, 1);
	padding-right: 20px;
`;
