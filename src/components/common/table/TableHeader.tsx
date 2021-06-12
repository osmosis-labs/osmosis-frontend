import React, { FunctionComponent, ReactNode } from 'react';
import cn from 'clsx';
import map from 'lodash-es/map';

export const TableHeader: FunctionComponent<TableHeader> = ({ widthArr, values, customClassArr, wrapperClass }) => {
	return (
		<ul className={cn('w-full flex', wrapperClass)}>
			{map(values, (v, i) => {
				return (
					<li
						key={i}
						className={cn('py-1 h-8 truncate font-mono text-gray-300', i < values?.length - 1 ? 'pl-1' : 'pr-1')}
						style={{ width: widthArr[i] }}>
						{v}
					</li>
				);
			})}
		</ul>
	);
};

interface TableHeader {
	widthArr: string[];
	values: ReactNode[];
	customClassArr?: string[];
	wrapperClass?: string;
}
