import styled from '@emotion/styled';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Center } from 'src/components/layouts/Containers';
import { PoolsPerPage } from 'src/config';

interface Props {
	page: number;
	numberOfPools: number;
}

export function AllPoolsPagination({ page: propPage, numberOfPools }: Props) {
	const history = useHistory();

	const numPages = Math.ceil((numberOfPools || 1) / PoolsPerPage);
	const pageRender = `${propPage} / ${numPages}`;

	const isFirstPage = propPage <= 1;
	const isLastPage = propPage >= numPages;

	return (
		<PaginationContainer>
			<ButtonArrow
				type="button"
				onClick={e => {
					if (!isFirstPage) {
						e.preventDefault();
						history.push(`/pools?page=${propPage - 1}`);
					}
				}}>
				<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24">
					<g transform="rotate(180, 12, 12)">
						<path
							style={{ fill: 'currentcolor', fillOpacity: isFirstPage ? 0.5 : 1 }}
							d="M9.759 7c.196 0 .391.072.54.214l4.437 4.18a.823.823 0 010 1.21l-4.433 4.184a.798.798 0 01-1.169-.094c-.222-.293-.157-.702.115-.96L13.206 12 9.253 8.267c-.288-.272-.341-.72-.077-1.014A.78.78 0 019.76 7z"
						/>
					</g>
				</svg>
			</ButtonArrow>
			<PageCounts>{pageRender}</PageCounts>
			<ButtonArrow
				type="button"
				onClick={e => {
					if (!isLastPage) {
						e.preventDefault();
						history.push(`/pools?page=${propPage + 1}`);
					}
				}}>
				<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24">
					<g>
						<path
							style={{ fill: 'currentcolor', fillOpacity: isLastPage ? 0.5 : 1 }}
							d="M9.759 7c.196 0 .391.072.54.214l4.437 4.18a.823.823 0 010 1.21l-4.433 4.184a.798.798 0 01-1.169-.094c-.222-.293-.157-.702.115-.96L13.206 12 9.253 8.267c-.288-.272-.341-.72-.077-1.014A.78.78 0 019.76 7z"
						/>
					</g>
				</svg>
			</ButtonArrow>
		</PaginationContainer>
	);
}

const ButtonArrow = styled.button`
	display: flex;
	align-items: center;
	color: rgba(196, 164, 106, 1);
	height: 2.25rem;
`;

const PageCounts = styled.div`
	align-self: center;
	padding: 5px;
`;

const PaginationContainer = styled.div`
	display: flex;
	width: 100%;
	justify-content: center;
	padding: 5px;
`;
