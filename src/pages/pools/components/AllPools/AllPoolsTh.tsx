import styled from '@emotion/styled';
import React, { HTMLAttributes } from 'react';
import { CenterV } from 'src/components/layouts/Containers';

export function AllPoolsTh({ widths }: { widths: string[] }) {
	return (
		<PoolsTableHeader as="th">
			<PoolsTableRow style={{ width: `${widths[0]}` }}>ID</PoolsTableRow>
			<PoolsTableRow style={{ width: `${widths[1]}` }}>Token Info</PoolsTableRow>
			<PoolsTableRow style={{ width: `${widths[2]}` }}>TVL</PoolsTableRow>
			<PoolsTableRow style={{ width: `${widths[3]}` }}>24h Volume</PoolsTableRow>
		</PoolsTableHeader>
	);
}
const PoolsTableHeader = styled(CenterV)`
	width: 100%;
	padding: 12px 20px;
	display: flex;
	align-items: center;
	background-color: rgba(45, 39, 85, 1);

	@media (min-width: 768px) {
		padding-left: 30px;
		padding-right: 35px;
		border-top-left-radius: 1rem;
		border-top-right-radius: 1rem;
	}
`;

function PoolsTableRow({ children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
	return (
		<CenterV as="td" {...props}>
			<TableCellText>{children}</TableCellText>
		</CenterV>
	);
}

const TableCellText = styled.p`
	font-size: 14px;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.38);

	@media (min-width: 768px) {
		font-size: 16px;
	}
`;
