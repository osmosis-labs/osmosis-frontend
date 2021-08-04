import styled from '@emotion/styled';
import { Dec } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import querystring from 'querystring';
import React, { useCallback, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { CenterV, FullWidthContainer } from 'src/components/layouts/Containers';
import { HideLBPPoolFromPage, HidePoolFromPage, PoolsPerPage } from 'src/config';
import { AllPoolsPagination } from 'src/pages/pools/components/AllPools/AllPoolsPagination';
import { AllPoolsThead } from 'src/pages/pools/components/AllPools/AllPoolsTh';
import { AllPoolsTr } from 'src/pages/pools/components/AllPools/AllPoolsTr';
import { usePoolWithFinancialDataList } from 'src/pages/pools/hooks/usePoolWithFinancialDataList';
import { commaizeNumber } from 'src/utils/format';

const FILTER_TVL_THRESHOLD = 1_000;
const TABLE_WIDTHS = ['10%', '40%', '30%', '20%'];

export const AllPools = observer(function AllPools() {
	const location = useLocation();
	const history = useHistory();

	const params: { page?: string } = querystring.parse(location.search.replace('?', ''));
	const page = params.page && !Number.isNaN(parseInt(params.page)) ? parseInt(params.page) : 1;

	const poolDataList = usePoolWithFinancialDataList();

	const [allPoolsShown, setAllPoolsShown] = useState<boolean>(false);

	const handleShowAllPoolsClicked = useCallback(() => {
		if (allPoolsShown) {
			history.replace('/pools?page=1');
		}
		setAllPoolsShown(shown => !shown);
	}, [allPoolsShown, history]);

	const poolDataListFiltered = useMemo(() => {
		if (allPoolsShown) {
			return poolDataList;
		}
		return poolDataList.filter(poolData => {
			const tvlPretty = poolData.tvl;
			return tvlPretty.toDec().gte(new Dec(FILTER_TVL_THRESHOLD));
		});
	}, [allPoolsShown, poolDataList]);

	const offset = (page - 1) * PoolsPerPage;

	return (
		<FullWidthContainer style={{ paddingBottom: '80px' }}>
			<ContainerShowAllPools>
				<h5 style={{ marginBottom: '30px' }}>All Pools</h5>
				<label htmlFor="show-all-pools">
					<CheckboxShowAllPools
						id="show-all-pools"
						type="checkbox"
						checked={allPoolsShown}
						onChange={handleShowAllPoolsClicked}
					/>
					<TextShowAllPools>Show pools less than ${commaizeNumber(FILTER_TVL_THRESHOLD)} TVL</TextShowAllPools>
				</label>
			</ContainerShowAllPools>
			<section>
				<table style={{ width: '100%' }}>
					<AllPoolsThead widths={TABLE_WIDTHS} />

					<tbody style={{ width: '100%' }}>
						{poolDataListFiltered.slice(offset, offset + PoolsPerPage).map(({ pool, volume24h, tvl, swapFee }) => {
							if ((HideLBPPoolFromPage && pool.smoothWeightChangeParams != null) || HidePoolFromPage[pool.id]) {
								return null;
							}
							return (
								<AllPoolsTr
									key={pool.id}
									id={pool.id}
									volume24h={volume24h}
									swapFee={swapFee}
									widths={TABLE_WIDTHS}
									poolRatios={pool.poolRatios}
									totalValueLocked={tvl}
								/>
							);
						})}
					</tbody>
				</table>

				<AllPoolsPagination page={page} numberOfPools={poolDataListFiltered.length} />
			</section>
		</FullWidthContainer>
	);
});

const CheckboxShowAllPools = styled.input`
	display: inline-block;
	margin-top: 6px;
`;

const TextShowAllPools = styled.span`
	display: inline-block;
	margin-left: 8px;
	user-select: none;
	cursor: pointer;
`;

const ContainerShowAllPools = styled(CenterV)`
	justify-content: space-between;
`;
