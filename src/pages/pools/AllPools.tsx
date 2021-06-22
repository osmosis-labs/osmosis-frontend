import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { Link, useHistory, useLocation } from 'react-router-dom';
import * as querystring from 'querystring';
import clsx from 'clsx';
import { HideLBPPoolFromPage, PoolsPerPage } from '../../config';

const widths = ['10%', '60%', '30%'];
export const AllPools: FunctionComponent = () => {
	return (
		<section>
			<h5 className="mb-7.5">All Pools</h5>
			<section>
				<PoolsTable />
			</section>
		</section>
	);
};

const PoolsTable: FunctionComponent = observer(() => {
	const location = useLocation();
	const params = querystring.parse(location.search.replace('?', '')) as {
		page?: string;
	};
	const page = params.page && !Number.isNaN(parseInt(params.page)) ? parseInt(params.page) : 1;

	const { chainStore, queriesStore, priceStore } = useStore();
	const queries = queriesStore.get(chainStore.current.chainId);

	const pools = queries.osmosis.queryGammPools.getPoolsPagenation(PoolsPerPage, page).pools;

	return (
		<React.Fragment>
			<table className="w-full">
				<TableHeader />
				<TableBody>
					{pools.map(pool => {
						if (HideLBPPoolFromPage && pool.smoothWeightChangeParams != null) {
							return null;
						}

						return (
							<TablePoolElement
								key={pool.id}
								id={pool.id}
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
								totalValueLocked={pool
									.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!)
									.toString()}
							/>
						);
					})}
				</TableBody>
			</table>
			<TablePagination page={page} />
		</React.Fragment>
	);
});

const TableHeader: FunctionComponent = () => {
	let i = 0;
	return (
		<thead className="h-11 w-full pl-7.5 pr-8.75 flex items-center rounded-t-2xl bg-card">
			<tr style={{ width: `${widths[i++]}` }} className="flex items-center">
				<th>
					<p className="font-semibold text-white-disabled">ID</p>
				</th>
			</tr>
			<tr style={{ width: `${widths[i++]}` }} className="flex items-center">
				<th>
					<p className="font-semibold text-white-disabled">Token Info</p>
				</th>
			</tr>
			<tr style={{ width: `${widths[i++]}` }} className="flex items-center">
				<th>
					<p className="font-semibold text-white-disabled">TVL</p>
				</th>
			</tr>
		</thead>
	);
};

const TableBody: FunctionComponent = ({ children }) => {
	return <tbody className="w-full">{children}</tbody>;
};

const TablePoolElement: FunctionComponent<{
	id: string;
	poolRatios: string;
	totalValueLocked: string;
}> = ({ id, poolRatios, totalValueLocked }) => {
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
				<p>{poolRatios}</p>
			</td>
			<td style={{ width: `${widths[2]}` }} className="flex items-center">
				<p>{totalValueLocked}</p>
			</td>
		</tr>
	);
};

const TablePagination: FunctionComponent<{
	page: number;
}> = observer(({ page: propPage }) => {
	const { chainStore, queriesStore } = useStore();
	const queries = queriesStore.get(chainStore.current.chainId);

	const numPages = queries.osmosis.queryGammNumPools.computeNumPages(PoolsPerPage);

	const history = useHistory();

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
});
