import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import times from 'lodash-es/times';
import { TABLE } from '../../constants';
import map from 'lodash-es/map';
import { multiply } from '../../utils/Big';
import { applyOptionalDecimal, formatUSD } from '../../utils/format';

const widths = ['10%', '60%', '30%'];

const defaultState = times(12, i => {
	return {
		id: i + 1,
		liquidity: 24350.831,
		tokenInfo: [
			{ token: 'atom', percent: 0.3 },
			{ token: 'iris', percent: 0.5 },
			{ token: 'scrt', percent: 0.2 },
		] as TTokenInfo[],
	} as TPool;
});
export const AllPools: FunctionComponent = () => {
	// TODO : @Thunnini update all pools with real data
	const [state, setState] = React.useState<TPool[]>(defaultState);
	const [pager, setPager] = React.useState<TPager>({
		currentPage: 1,
		totalPage: Math.ceil(state.length / TABLE.ROW_CNT),
	});
	const paginatedData = React.useMemo(() => {
		return state.slice((pager.currentPage - 1) * TABLE.ROW_CNT, pager.currentPage * TABLE.ROW_CNT);
	}, [pager.currentPage, state]);
	return (
		<section>
			<h5 className="mb-7.5">All Pools</h5>
			<table className="min-w-table w-full">
				<TableHeader />
				<TableBody data={paginatedData} rowHeight={TABLE.ROW_HEIGHT} />
				{/*<PoolsTable />*/}
			</table>
			<TablePagination pager={pager} setCurrentPage={newPage => setPager(v => ({ ...v, currentPage: newPage }))} />
		</section>
	);
};

const TableBody: FunctionComponent<ITableBody> = ({ data, rowHeight }) => {
	return (
		<>
			<tbody className="w-full">
				{map(data, pool => (
					<TableRow key={pool.id} data={pool} rowHeight={rowHeight} />
				))}
			</tbody>
		</>
	);
};
interface TPager {
	currentPage: number;
	totalPage: number;
}

const TablePagination: FunctionComponent<ITablePagination> = ({ pager, setCurrentPage }) => {
	return (
		<div className="mt-4 flex items-center justify-center w-full">
			<ul className="flex items-center">
				{times(pager.totalPage, i => (
					<li
						key={i}
						onClick={() => setCurrentPage(i + 1)}
						className={cn(
							'mx-1 px-2 py-1 cursor-pointer text-sm rounded-md text-secondary-200',
							pager.currentPage === i + 1 ? 'border border-secondary-200 bg-button-hover' : 'hover:opacity-75'
						)}>
						{i + 1}
					</li>
				))}
			</ul>
		</div>
	);
};
interface ITablePagination {
	pager: TPager;
	setCurrentPage: (page: number) => void;
}

const TableRow: FunctionComponent<ITableRow> = ({ data, rowHeight }) => {
	let i = 0;
	return (
		<tr
			style={{ height: `${rowHeight}px` }}
			className="flex items-center pl-7.5 pr-8.75 border-b border-white-faint text-white-emphasis hover:bg-card cursor-pointer group w-full">
			<td className="px-1" style={{ width: widths[i++] }}>
				<p className="font-semibold text-white-disabled">{data.id}</p>
			</td>
			<td className="px-1 group-hover:text-enabledGold" style={{ width: widths[i++] }}>
				<p>
					{map(data.tokenInfo, (info, i) => (
						<span key={i}>
							{applyOptionalDecimal(multiply(info.percent, 100, 2))}% {info.token.toUpperCase()}
							{i !== data.tokenInfo.length - 1 && ', '}
						</span>
					))}
				</p>
			</td>
			<td className="px-1" style={{ width: widths[i++] }}>
				<p>{formatUSD(data.liquidity)}</p>
			</td>
		</tr>
	);
};

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

// const PoolsTable: FunctionComponent = () => {
// 	return (
// 		<React.Fragment>
// 			<table className="w-full">
// 				<TableHeader />
// 				<TableBody>
// 					<TablePoolElement id="1" poolRatios="30% ATOM, 50% IRIS, 20% OSMO" totalValueLocked="$2,304" />
// 					<TablePoolElement id="2" poolRatios="30% ATOM, 50% IRIS, 20% OSMO" totalValueLocked="$2,304" />
// 					<TablePoolElement id="3" poolRatios="30% ATOM, 50% IRIS, 20% OSMO" totalValueLocked="$2,304" />
// 				</TableBody>
// 			</table>
// 			<TablePagination />
// 		</React.Fragment>
// 	);
// };

// const TableBody: FunctionComponent = ({ children }) => {
// 	return <tbody className="w-full">{children}</tbody>;
// };

// const TablePoolElement: FunctionComponent<{
// 	id: string;
// 	poolRatios: string;
// 	totalValueLocked: string;
// }> = ({ id, poolRatios, totalValueLocked }) => {
// 	return (
// 		<tr className="h-14 w-full pl-7.5 pr-8.75 flex flex-row items-center group hover:bg-container-hover cursor-pointer border-b">
// 			<td style={{ width: `${widths[0]}` }} className="flex items-center text-white-disabled">
// 				<p>{id}</p>
// 			</td>
// 			<td style={{ width: `${widths[1]}` }} className="flex items-center group-hover:text-secondary-200">
// 				<p>{poolRatios}</p>
// 			</td>
// 			<td style={{ width: `${widths[2]}` }} className="flex items-center">
// 				<p>{totalValueLocked}</p>
// 			</td>
// 		</tr>
// 	);
// };

// const TablePagination: FunctionComponent = () => {
// 	return (
// 		<div className="w-full p-4 flex items-center justify-center">
// 			<button
// 				type="button"
// 				className="flex items-center rounded-md h-9 px-3 text-sm text-secondary-200 border border-secondary-200">
// 				<p>1</p>
// 			</button>
// 			<button type="button" className="flex items-center rounded-md h-9 px-3 text-sm text-secondary-200">
// 				<p>2</p>
// 			</button>
// 			<button type="button" className="flex items-center rounded-md h-9 px-3 text-sm text-secondary-200">
// 				<p>3</p>
// 			</button>
// 			<button type="button" className="flex items-center h-9 text-secondary-200">
// 				<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24">
// 					<g>
// 						<g>
// 							<path
// 								className="fill-current"
// 								d="M9.759 7c.196 0 .391.072.54.214l4.437 4.18a.823.823 0 010 1.21l-4.433 4.184a.798.798 0 01-1.169-.094c-.222-.293-.157-.702.115-.96L13.206 12 9.253 8.267c-.288-.272-.341-.72-.077-1.014A.78.78 0 019.76 7z"
// 							/>
// 						</g>
// 					</g>
// 				</svg>
// 			</button>
// 		</div>
// 	);
// };

interface TPool {
	id: number;
	tokenInfo: TTokenInfo[];
	liquidity: number;
	volume: number;
	fees: number;
}
interface TTokenInfo {
	token: string;
	percent: number;
}

interface ITableBody {
	data: TPool[];
	rowHeight: number;
}

interface ITableRow {
	data: TPool;
	rowHeight: number;
}
