import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React, { HTMLAttributes } from 'react';
import { CenterV } from 'src/components/layouts/Containers';
import { PoolCardTokenIcon } from 'src/components/PoolCardTokenIcon';
import { isMyPoolCardProp } from 'src/pages/pools/components/PoolCardList/utils/isMyPoolCardProp';
import { IncentivizedPoolCardProp, MyPoolCardProp } from 'src/pages/pools/models/poolCardProps';
import { applyOptionalDecimal } from 'src/utils/format';
import { Optional } from 'utility-types';
import { CardInfoPlaceholder } from 'src/components/common/CardInfoPlaceholder';
import { useStore } from 'src/stores';

export function PoolCardItem(
	props: (IncentivizedPoolCardProp | Optional<MyPoolCardProp, 'myLiquidity'>) & {
		onClick: HTMLAttributes<HTMLDivElement>['onClick'];
	}
) {
	const { poolId, tokens, liquidity, apr, onClick } = props;

	const { chainStore, queriesStore } = useStore();
	const queries = queriesStore.get(chainStore.current.chainId);
	const isSuperfluidEnabled = queries.osmosis.querySuperfluidPools.isSuperfluidPool(poolId);

	return (
		<div
			className={`rounded-xl p-0.25 hover:bg-enabledGold ${isSuperfluidEnabled ? 'bg-sfs hover:bg-none' : 'bg-card'}`}
			onClick={onClick}>
			<PoolCardItemContainer>
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
								<PoolValueText>{liquidity.value}</PoolValueText>
							</div>
							{apr?.value && (
								<div style={{ marginLeft: '20px' }}>
									<PoolHeaderText>APR</PoolHeaderText>
									{apr.isLoading ? (
										<CardInfoPlaceholder className="w-18 h-4 bg-cardInfoPlaceholder" />
									) : (
										<PoolValueText>{apr.value}%</PoolValueText>
									)}
								</div>
							)}
						</CenterV>

						<Hr apr={apr?.value} myLockedAmount={props.myLockedAmount?.value} />

						<CenterV>
							<div>
								<PoolHeaderText>My Liquidity</PoolHeaderText>
								{props.myLiquidity.isLoading ? (
									<CardInfoPlaceholder className="w-23 h-4 bg-cardInfoPlaceholder" />
								) : (
									<PoolValueText>{props.myLiquidity.value}</PoolValueText>
								)}
							</div>
							{props.myLockedAmount?.value && (
								<div style={{ marginLeft: '20px' }}>
									<PoolHeaderText>My Bonded Amount</PoolHeaderText>

									{props.myLockedAmount.isLoading ? (
										<CardInfoPlaceholder className="w-23 h-4 bg-cardInfoPlaceholder" />
									) : (
										<PoolValueText>{props.myLockedAmount.value}</PoolValueText>
									)}
								</div>
							)}
						</CenterV>
					</>
				) : (
					<CenterV>
						<AprCol>
							<PoolHeaderText>APR</PoolHeaderText>
							{apr?.isLoading ? (
								<CardInfoPlaceholder className="w-18 h-4 bg-cardInfoPlaceholder" />
							) : (
								<PoolValueText>{apr?.value}%</PoolValueText>
							)}
						</AprCol>
						<div style={{ marginLeft: '20px' }}>
							<PoolHeaderText>Pool Liquidity</PoolHeaderText>
							<PoolValueText>{liquidity.value}</PoolValueText>
						</div>
					</CenterV>
				)}
			</PoolCardItemContainer>
		</div>
	);
}

const PoolCardItemContainer = styled.li`
	cursor: pointer;
	padding: 19px;
	background-color: rgba(45, 39, 85, 1);
	border-radius: 0.75rem;

	@media (min-width: 768px) {
		padding: 23px 29px;
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
