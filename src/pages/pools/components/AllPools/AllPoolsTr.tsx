import styled from '@emotion/styled';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { CenterV } from 'src/components/layouts/Containers';
import { QueriedPoolBase } from 'src/stores/osmosis/query/pool';

interface Props {
	id: string;
	poolRatios: QueriedPoolBase['poolRatios'];
	totalValueLocked: PricePretty;
	volume24h: string;
	swapFee: string;
	widths: string[];
}

export const AllPoolsTr = observer(function AllPoolsTr({
	id,
	poolRatios,
	totalValueLocked,
	volume24h,
	swapFee,
	widths,
}: Props) {
	const history = useHistory();

	const poolRatioText = useMemo(
		() =>
			poolRatios
				.map(poolRatio => {
					const currency = poolRatio.amount.currency;
					// Pools Table에서는 IBC Currency의 coinDenom을 무시하고 원래의 coinDenom을 보여준다.
					const displayDenom =
						'originCurrency' in currency && currency.originCurrency
							? currency.originCurrency.coinDenom
							: currency.coinDenom;

					return `${poolRatio.ratio.maxDecimals(1).toString()}% ${displayDenom.toUpperCase()}`;
				})
				.join(', '),
		[poolRatios]
	);

	return (
		<TrStyled
			onClick={e => {
				e.preventDefault();
				history.push(`/pool/${id}`);
			}}>
			<CenterV as="td" style={{ width: `${widths[0]}`, color: 'rgba(255, 255, 255, 0.38)' }}>
				<p>{id}</p>
			</CenterV>

			<CenterV as="td" style={{ width: `${widths[1]}` }}>
				<CenterV>
					<TextPoolRatio>{poolRatioText}</TextPoolRatio>
					<Badge>{swapFee}</Badge>
				</CenterV>
			</CenterV>

			<CenterV as="td" style={{ width: `${widths[2]}` }}>
				<p>{totalValueLocked.toString()}</p>
			</CenterV>

			<CenterV as="td" style={{ width: `${widths[3]}` }}>
				<p>{volume24h}</p>
			</CenterV>
		</TrStyled>
	);
});

const TrStyled = styled.tr`
	width: 100%;
	height: 3.5rem;
	padding-left: 30px;
	padding-right: 35px;
	display: flex;
	align-items: center;
	cursor: pointer;
	&:hover {
		background-color: rgba(255, 255, 255, 0.04);
		p,
		span {
			color: rgba(196, 164, 106, 1);
		}
	}
	border-bottom-width: 1px;
`;

const TextPoolRatio = styled.p`
	flex: 1 1 auto;
`;

const Badge = styled.span`
	border-radius: 8px;
	display: flex;
	align-items: center;
	padding: 5px 8px;
	height: 25px;
	min-width: 20px;
	background-color: rgba(45, 39, 85, 1);
	margin-left: 8px;
	margin-right: 8px;
`;
