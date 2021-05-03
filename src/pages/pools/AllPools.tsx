import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import times from 'lodash-es/times';
import { TABLE } from '../../constants';
import map from 'lodash-es/map';
import { multiply } from '../../utils/Big';
import { applyOptionalDecimal, formatUSD } from '../../utils/format';

const widths = ['10%', '40%', '20%', '15%', '15%'];

const defaultState = times(12, i => {
	return {
		id: i + 1,
		liquidity: 24350.831,
		volume: 250.342,
		fees: 360.342,
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
	console.log(Math.min(TABLE.ROW_CNT, state.length) * TABLE.ROW_HEIGHT);
	return (
		<section>
			<h5 className="mb-7.5">All Pools</h5>
			<section className="min-w-table">
				<TableHeader />
				<div>
					<TableBody data={state} rowHeight={TABLE.ROW_HEIGHT} />
				</div>
			</section>
		</section>
	);
};

const TableBody: FunctionComponent<ITableBody> = ({ data, rowHeight }) => {
	const [pager, setPager] = React.useState<TPager>({
		currentPage: 1,
		totalPage: Math.ceil(data.length / TABLE.ROW_CNT),
	});
	const paginatedData = React.useMemo(() => {
		return data.slice((pager.currentPage - 1) * TABLE.ROW_CNT, pager.currentPage * TABLE.ROW_CNT);
	}, [pager.currentPage, data]);
	return (
		<>
			<div style={{ minHeight: `${Math.min(TABLE.ROW_CNT, data.length) * TABLE.ROW_HEIGHT}px` }} className="w-full">
				{map(paginatedData, pool => (
					<TableRow key={pool.id} data={pool} rowHeight={rowHeight} />
				))}
			</div>
			<TablePagination pager={pager} setCurrentPage={newPage => setPager(v => ({ ...v, currentPage: newPage }))} />
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
		<ul
			style={{ height: `${rowHeight}px` }}
			className="flex items-center pl-7.5 pr-8.75 border-b border-white-faint text-white-emphasis hover:bg-card cursor-pointer group">
			<li className="px-1" style={{ width: widths[i++] }}>
				<p className="font-semibold text-white-disabled">{data.id}</p>
			</li>
			<li className="px-1 group-hover:text-enabledGold" style={{ width: widths[i++] }}>
				<p>
					{map(data.tokenInfo, (info, i) => (
						<span key={i}>
							{applyOptionalDecimal(multiply(info.percent, 100, 2))}% {info.token.toUpperCase()}
							{i !== data.tokenInfo.length - 1 && ', '}
						</span>
					))}
				</p>
			</li>
			<li className="px-1" style={{ width: widths[i++] }}>
				<p>{formatUSD(data.liquidity)}</p>
			</li>
			<li className="px-1" style={{ width: widths[i++] }}>
				<p>{formatUSD(data.volume)}</p>
			</li>
			<li className="px-1 flex justify-end items-center" style={{ width: widths[i++] }}>
				<p>{formatUSD(data.fees)}</p>
			</li>
		</ul>
	);
};

const TableHeader: FunctionComponent = () => {
	let i = 0;
	return (
		<ul className="h-11 w-full pl-7.5 pr-8.75 flex items-center rounded-t-2xl bg-card border-b border-white-faint">
			<li style={{ width: `${widths[i++]}` }} className="flex items-center">
				<p className="font-semibold text-white-disabled">ID</p>
			</li>
			<li style={{ width: `${widths[i++]}` }} className="flex items-center">
				<p className="font-semibold text-white-disabled">Token Info</p>
			</li>
			<li style={{ width: `${widths[i++]}` }} className="flex items-center">
				<p className="font-semibold text-white-disabled">TVL</p>
			</li>
			<li style={{ width: `${widths[i++]}` }} className="flex items-center">
				<p className="font-semibold text-white-disabled">VOLUME</p>
			</li>
			<li style={{ width: `${widths[i++]}` }} className="flex items-center justify-end">
				<p className="font-semibold text-white-disabled">Tx Fee (24h)</p>
			</li>
		</ul>
	);
};

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
