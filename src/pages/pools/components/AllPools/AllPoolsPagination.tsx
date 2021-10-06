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

	const isFirstPage = propPage <= 1;
	const isLastPage = propPage >= numPages;

	return (
		<PaginationContainer>
			<nav className="flex">
				{!isFirstPage ? (
					<ButtonArrow
						type="button"
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
										style={{ fill: 'currentcolor' }}
										d="M9.759 7c.196 0 .391.072.54.214l4.437 4.18a.823.823 0 010 1.21l-4.433 4.184a.798.798 0 01-1.169-.094c-.222-.293-.157-.702.115-.96L13.206 12 9.253 8.267c-.288-.272-.341-.72-.077-1.014A.78.78 0 019.76 7z"
									/>
								</g>
							</g>
						</svg>
					</ButtonArrow>
				) : null}

				{Array.from(Array(numPages), (_, i) => i + 1).map(page => {
					return (
						<LinkStyled key={page.toString()} to={`/pools?page=${page}`} index={page} page={propPage}>
							<p>{page}</p>
						</LinkStyled>
					);
				})}

				{!isLastPage ? (
					<ButtonArrow
						type="button"
						onClick={e => {
							e.preventDefault();
							history.push(`/pools?page=${propPage + 1}`);
						}}>
						<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24">
							<g>
								<g>
									<path
										style={{ fill: 'currentcolor' }}
										d="M9.759 7c.196 0 .391.072.54.214l4.437 4.18a.823.823 0 010 1.21l-4.433 4.184a.798.798 0 01-1.169-.094c-.222-.293-.157-.702.115-.96L13.206 12 9.253 8.267c-.288-.272-.341-.72-.077-1.014A.78.78 0 019.76 7z"
									/>
								</g>
							</g>
						</svg>
					</ButtonArrow>
				) : null}
			</nav>
		</PaginationContainer>
	);
}

const ButtonArrow = styled.button`
	display: flex;
	align-items: center;
	color: rgba(196, 164, 106, 1);
	height: 2.25rem;
`;

const PaginationContainer = styled(Center)`
	width: 100%;
	padding: 16px;
	overflow: scroll;
`;

const LinkStyled = styled(Link)<{ index: number; page: number }>`
	display: flex;
	align-items: center;
	border-radius: 0.375rem;
	height: 2.25rem;
	padding-left: 12px;
	padding-right: 12px;
	font-size: 14px;
	color: rgba(196, 164, 106, 1);
	${({ index, page }) => (index === page ? { borderWidth: '1px', borderColor: 'rgba(196, 164, 106, 1)' } : null)}
`;
