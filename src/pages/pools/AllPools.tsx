import React, { FunctionComponent } from 'react';
import cn from 'clsx';

const widths = ['10%', '30%', '20%', '20%', '20%'];
export const AllPools: FunctionComponent = () => {
	return (
		<section>
			<h5 className="mb-7.5">All Pools</h5>
			<section className="min-w-table">
				<TableHeader />
			</section>
		</section>
	);
};

const TableHeader: FunctionComponent = () => {
	let i = 0;
	return (
		<ul className="h-11 w-full pl-7.5 pr-8.75 flex items-center rounded-t-2xl bg-card">
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
