import styled from '@emotion/styled';
import React, { FunctionComponent, HTMLAttributes, useCallback, useState } from 'react';
import cn from 'clsx';
import { TSIDEBAR_ITEM } from 'src/constants';
import { NavLink } from 'react-router-dom';
import { cssAbsoluteCenter } from 'src/emotionStyles/layout';
import { IconExternalLink } from 'src/icons';

const NavLinkFallback: FunctionComponent<{ sidebarItem: TSIDEBAR_ITEM; closeSidebar: () => void }> = ({
	sidebarItem,
	closeSidebar,
	children,
}) => {
	return (
		<React.Fragment>
			{sidebarItem.ROUTE ? (
				<NavLink exact to={sidebarItem.ROUTE} onClick={closeSidebar}>
					{children}
				</NavLink>
			) : (
				<a href={sidebarItem.LINK} target="_blank" rel="noreferrer">
					{children}
				</a>
			)}
		</React.Fragment>
	);
};

export const SidebarItem: FunctionComponent<TSidebarItem> = ({ sidebarItem, selected, closeSidebar }) => {
	return (
		<NavLinkFallback sidebarItem={sidebarItem} closeSidebar={closeSidebar}>
			<li
				className={cn('h-15 flex items-center group', {
					'opacity-75 hover:opacity-100 transition-all': !selected,
				})}>
				<div className="h-11 w-11 relative">
					<img
						className={cn('w-full h-full absolute top-0 left-0 transition-all')}
						src={
							selected
								? '/public/assets/sidebar/icon-border_selected.svg'
								: '/public/assets/sidebar/icon-border_unselected.svg'
						}
					/>
					<img
						className="w-5 h-5 s-position-abs-center z-10"
						src={selected ? sidebarItem.ICON_SELECTED : sidebarItem.ICON}
					/>
				</div>
				<p
					className={cn(
						'ml-2.5 text-base overflow-x-hidden transition-all  font-bold transition-all max-w-24',
						selected ? 'text-white-high' : 'text-iconDefault group-hover:text-white-mid'
					)}>
					{sidebarItem.TEXT}
				</p>
				{sidebarItem.LINK ? (
					<div className="ml-2">
						<IconExternalLink />
					</div>
				) : null}
			</li>
		</NavLinkFallback>
	);
};

interface TSidebarItem {
	selected?: boolean;
	sidebarItem: TSIDEBAR_ITEM;
	closeSidebar: () => void;
}

interface DisplayIconProps extends HTMLAttributes<HTMLDivElement> {
	icon: string;
	iconSelected: string;
	className?: string;
	isActive?: boolean;
}

export function DisplayIcon({
	icon,
	iconSelected,
	isActive,
	onMouseEnter,
	onMouseLeave,
	onTouchStart,
	onTouchEnd,
	...props
}: DisplayIconProps) {
	const [hovering, setHovering] = useState(false);
	const handleMouseEnter = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			setHovering(true);
			onMouseEnter?.(event);
		},
		[onMouseEnter]
	);
	const handleTouchStart = useCallback(
		(event: React.TouchEvent<HTMLDivElement>) => {
			setHovering(true);
			onTouchStart?.(event);
		},
		[onTouchStart]
	);
	const handleMouseLeave = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			setHovering(false);
			onMouseLeave?.(event);
		},
		[onMouseLeave]
	);

	const handleTouchEnd = useCallback(
		(event: React.TouchEvent<HTMLDivElement>) => {
			setHovering(false);
			onTouchEnd?.(event);
		},
		[onTouchEnd]
	);
	return (
		<DisplayIconContainer
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			{...props}>
			<IconBgImg
				src={
					isActive || hovering
						? '/public/assets/sidebar/icon-border_selected.svg'
						: '/public/assets/sidebar/icon-border_unselected.svg'
				}
			/>
			<IconImg src={isActive || hovering ? iconSelected : icon} />
		</DisplayIconContainer>
	);
}

const DisplayIconContainer = styled.div`
	height: 2.25rem;
	width: 2.5rem;
	position: relative;
	cursor: pointer;
	@media (min-width: 768px) {
		height: 2.75rem;
		width: 2.75rem;
	}
`;

const IconBgImg = styled.img`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
`;

const IconImg = styled.img`
	${cssAbsoluteCenter}
	width: 1.125rem
	height: 1.125rem
	z-index: 10;
	@media (min-width: 768px) {
		width: 1.25rem;
		height: 1.25rem;
	}
`;
