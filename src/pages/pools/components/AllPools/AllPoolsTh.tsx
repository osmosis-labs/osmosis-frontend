import styled from '@emotion/styled';
import React, { HTMLAttributes } from 'react';
import { CenterV } from 'src/components/layouts/Containers';

export function AllPoolsThead({ widths }: { widths: string[] }) {
	return (
		<PoolsTableHeader as="thead">
			<PoolsTableRow style={{ width: `${widths[0]}` }}>ID</PoolsTableRow>
			<PoolsTableRow style={{ width: `${widths[1]}` }}>Token Info</PoolsTableRow>
			<PoolsTableRow style={{ width: `${widths[2]}` }}>TVL</PoolsTableRow>
			<PoolsTableRow style={{ width: `${widths[3]}` }}>24h Volume</PoolsTableRow>
		</PoolsTableHeader>
	);
}
const PoolsTableHeader = styled(CenterV)`
	width: 100%;
	height: 2.75rem;
	padding-left: 30px;
	padding-right: 35px;
	border-top-left-radius: 1rem;
	border-top-right-radius: 1rem;
	background-color: rgba(45, 39, 85, 1);
`;

function PoolsTableRow({ children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
	return (
		<CenterV as="tr" {...props}>
			<th>
				<TableCellText>{children}</TableCellText>
			</th>
		</CenterV>
	);
}

const TableCellText = styled.p`
	font-weight: 600;
	color: rgba(255, 255, 255, 0.38);
`;
