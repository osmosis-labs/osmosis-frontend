import { Dec } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import * as querystring from 'querystring';
import React, { FunctionComponent, HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { HideLBPPoolFromPage, HidePoolFromPage, PoolsPerPage } from '../../config';
import { usePoolFinancialData } from '../../hooks/pools/usePoolFinancialData';
import { useStore } from '../../stores';
import { commaizeNumber } from '../../utils/format';

const widths = ['10%', '40%', '30%', '20%'];

const FILTER_TVL_THRESHOLD = 1_000;

export const AllPools: FunctionComponent = () => {
	const history = useHistory();
	const [allPoolsShown, setAllPoolsShown] = useState<boolean>(false);
	const handleShowAllPoolsClicked = useCallback(() => {
		if (allPoolsShown) {
			history.replace('/pools?page=1');
		}
		setAllPoolsShown(shown => !shown);
	}, [allPoolsShown, history]);
	return (
		<section>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<h5 className="mb-7.5">All Pools</h5>
				<label htmlFor="show-all-pools">
					<input
						id="show-all-pools"
						type="checkbox"
						style={{ display: 'inline-block', marginTop: '6px' }}
						checked={allPoolsShown}
						onChange={handleShowAllPoolsClicked}
					/>
					<span
						style={{
							display: 'inline-block',
							marginLeft: '8px',
							userSelect: 'none',
							cursor: 'pointer',
						}}>
						Show pools less than ${commaizeNumber(FILTER_TVL_THRESHOLD)} TVL
					</span>
				</label>
			</div>
			<section>
				<PoolsTable allPoolsShown={allPoolsShown} />
			</section>
		</section>
	);
};

const PoolsTable = observer(({ allPoolsShown }: { allPoolsShown: boolean }) => {
	const location = useLocation();
	const params: { page?: string } = querystring.parse(location.search.replace('?', ''));
	const page = params.page && !Number.isNaN(parseInt(params.page)) ? parseInt(params.page) : 1;

	const poolDataList = usePoolWithFinancialDataList();
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
		<React.Fragment>
			<table className="w-full">
				<TableHeader />
				<tbody className="w-full">
					{poolDataListFiltered.slice(offset, offset + PoolsPerPage).map(({ pool, volume24h, tvl, swapFee }) => {
						if (HideLBPPoolFromPage && pool.smoothWeightChangeParams != null) {
							return null;
						}

						if (HidePoolFromPage[pool.id]) {
							return null;
						}

						return (
							<TablePoolElement
								key={pool.id}
								id={pool.id}
								volume24h={volume24h}
								swapFee={swapFee}
								poolRatios={pool.poolRatios
									.map(poolRatio => {
										// Pools Table에서는 IBC Currency의 coinDenom을 무시하고 원래의 coinDenom을 보여준다.
										const displayDenom = (() => {
											const currency = poolRatio.amount.currency;
											if ('originCurrency' in currency && currency.originCurrency) {
												return currency.originCurrency.coinDenom;
											}

											return currency.coinDenom;
										})().toUpperCase();

										return `${poolRatio.ratio.maxDecimals(1).toString()}% ${displayDenom}`;
									})
									.join(', ')}
								totalValueLocked={tvl}
							/>
						);
					})}
				</tbody>
			</table>
			<TablePagination page={page} numberOfPools={poolDataListFiltered.length} />
		</React.Fragment>
	);
});

function TableHeader() {
	return (
		<thead className="h-11 w-full pl-7.5 pr-8.75 flex items-center rounded-t-2xl bg-card">
			<tr style={{ width: `${widths[0]}` }} className="flex items-center">
				<th>
					<p className="font-semibold text-white-disabled">ID</p>
				</th>
			</tr>
			<tr style={{ width: `${widths[1]}` }} className="flex items-center">
				<th>
					<p className="font-semibold text-white-disabled">Token Info</p>
				</th>
			</tr>
			<tr style={{ width: `${widths[2]}` }} className="flex items-center">
				<th>
					<p className="font-semibold text-white-disabled">TVL</p>
				</th>
			</tr>
			<tr style={{ width: `${widths[3]}` }} className="flex items-center">
				<th>
					<p className="font-semibold text-white-disabled">24h Volume</p>
				</th>
			</tr>
		</thead>
	);
}

interface TablePoolElementProps {
	id: string;
	poolRatios: string;
	totalValueLocked: PricePretty;
	volume24h: string;
	swapFee: string;
}

function TablePoolElement({ id, poolRatios, totalValueLocked, volume24h, swapFee }: TablePoolElementProps) {
	const history = useHistory();

	return (
		<tr
			className="h-14 w-full pl-7.5 pr-8.75 flex flex-row items-center group hover:bg-container-hover cursor-pointer border-b"
			onClick={e => {
				e.preventDefault();

				history.push(`/pool/${id}`);
			}}>
			<td style={{ width: `${widths[0]}` }} className="flex items-center text-white-disabled">
				<p>{id}</p>
			</td>
			<td style={{ width: `${widths[1]}` }} className="flex items-center group-hover:text-secondary-200">
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<p style={{ flex: '1 1 auto' }}>{poolRatios}</p>
					<Badge>{swapFee}</Badge>
				</div>
			</td>
			<td style={{ width: `${widths[2]}` }} className="flex items-center">
				<p>{totalValueLocked.toString()}</p>
			</td>
			<td style={{ width: `${widths[3]}` }} className="flex items-center">
				<p>{volume24h}</p>
			</td>
		</tr>
	);
}

function Badge({ children, ...props }: HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			style={{
				borderRadius: '8px',
				display: 'flex',
				alignItems: 'center',
				padding: '5px 8px',
				height: '25px',
				minWidth: '20px',
				backgroundColor: 'rgba(45, 39, 85, var(--tw-bg-opacity))',
				marginLeft: '8px',
				marginRight: '8px',
				flex: '0 0 auto',
				fontSize: '12px',
			}}
			{...props}>
			{children}
		</span>
	);
}

function TablePagination({ page: propPage, numberOfPools }: { page: number; numberOfPools: number }) {
	const history = useHistory();

	const numPages = Math.ceil((numberOfPools || 1) / PoolsPerPage);

	const pageRender = [];

	for (let i = 0; i < numPages; i++) {
		const page = i + 1;

		pageRender.push(
			<Link
				key={page.toString()}
				to={`/pools?page=${page}`}
				className={clsx('flex items-center rounded-md h-9 px-3 text-sm text-secondary-200', {
					'border border-secondary-200': page === propPage,
				})}>
				<p>{page}</p>
			</Link>
		);
	}

	const isFirstPage = propPage <= 1;
	const isLastPage = propPage >= numPages;

	return (
		<div className="w-full p-4 flex items-center justify-center">
			{!isFirstPage ? (
				<button
					type="button"
					className="flex items-center h-9 text-secondary-200"
					onClick={e => {
						e.preventDefault();

						history.push(`/pools?page=${propPage - 1}`);
					}}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="28"
						height="28"
						fill="none"
						viewBox="0 0 24 24"
						transform="rotate(180) translate(-4, 0)">
						<g>
							<g>
								<path
									className="fill-current"
									d="M9.759 7c.196 0 .391.072.54.214l4.437 4.18a.823.823 0 010 1.21l-4.433 4.184a.798.798 0 01-1.169-.094c-.222-.293-.157-.702.115-.96L13.206 12 9.253 8.267c-.288-.272-.341-.72-.077-1.014A.78.78 0 019.76 7z"
								/>
							</g>
						</g>
					</svg>
				</button>
			) : null}
			{pageRender}
			{!isLastPage ? (
				<button
					type="button"
					className="flex items-center h-9 text-secondary-200"
					onClick={e => {
						e.preventDefault();

						history.push(`/pools?page=${propPage + 1}`);
					}}>
					<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24">
						<g>
							<g>
								<path
									className="fill-current"
									d="M9.759 7c.196 0 .391.072.54.214l4.437 4.18a.823.823 0 010 1.21l-4.433 4.184a.798.798 0 01-1.169-.094c-.222-.293-.157-.702.115-.96L13.206 12 9.253 8.267c-.288-.272-.341-.72-.077-1.014A.78.78 0 019.76 7z"
								/>
							</g>
						</g>
					</svg>
				</button>
			) : null}
		</div>
	);
}

function usePoolWithFinancialDataList() {
	const { chainStore, queriesStore, priceStore } = useStore();
	const queries = queriesStore.get(chainStore.current.chainId);

	const pools = queries.osmosis.queryGammPools.getPoolsDescendingOrderTVL(
		priceStore,
		priceStore.getFiatCurrency('usd')!
	);
	const poolFinancialDataByPoolId = usePoolFinancialData();

	return useMemo(() => {
		return pools.map(pool => {
			const volume24hRaw = poolFinancialDataByPoolId.data?.[pool.id]?.[0]?.volume_24h;
			/**
			 * Sometimes, the volume24h has the decimals greater than 18.
			 * In this case, the `Dec` type can't handle such big decimals.
			 * So, must truncate the decimals with `toFixed()` method.
			 * */
			const volume24h =
				volume24hRaw != null
					? new PricePretty(priceStore.getFiatCurrency('usd')!, new Dec(volume24hRaw.toFixed(10))).toString()
					: '...';
			const tvl = pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!);
			const swapFee = `${pool.swapFee.toString()}%`;
			return { pool, volume24h, tvl, swapFee };
		});
	}, [pools, poolFinancialDataByPoolId.data, priceStore]);
}
