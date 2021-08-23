import styled from '@emotion/styled';
import React, { FunctionComponent, HTMLAttributes, useCallback, useState } from 'react';
import cn from 'clsx';
import { Img } from 'src/components/common/Img';
import { TSIDEBAR_ITEM } from 'src/constants';
import { NavLink } from 'react-router-dom';
import { cssAbsoluteCenter } from 'src/emotionStyles/layout';

const NavLinkFallback: FunctionComponent<{ sidebarItem: TSIDEBAR_ITEM }> = ({ sidebarItem, children }) => {
	return (
		<React.Fragment>
			{sidebarItem.ROUTE ? (
				<NavLink exact to={sidebarItem.ROUTE}>
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

export const SidebarItem: FunctionComponent<TSidebarItem> = ({ sidebarItem, openSidebar, selected }) => {
	return (
		<NavLinkFallback sidebarItem={sidebarItem}>
			<li
				className={cn('h-15 flex items-center group', {
					'opacity-75 hover:opacity-100 transition-all': !selected,
				})}>
				<div className="h-11 w-11 relative">
					<Img
						className={cn('w-full h-full absolute top-0 left-0 transition-all')}
						src={
							selected
								? '/public/assets/sidebar/icon-border_selected.svg'
								: '/public/assets/sidebar/icon-border_unselected.svg'
						}
					/>
					<Img
						className="w-5 h-5 s-position-abs-center z-10"
						src={selected ? sidebarItem.ICON_SELECTED : sidebarItem.ICON}
					/>
				</div>
				<p
					style={{ maxWidth: openSidebar ? '100px' : '0px' }}
					className={cn(
						'ml-2.5 text-base overflow-x-hidden transition-all font-bold transition-all',
						selected ? 'text-white-high' : 'text-iconDefault group-hover:text-white-mid'
					)}>
					{sidebarItem.TEXT}
				</p>
				{sidebarItem.LINK ? <img className="ml-2" src="/public/assets/sidebar/icon-link-deco.svg" alt="link" /> : null}
			</li>
		</NavLinkFallback>
	);
};
interface TSidebarItem {
	selected?: boolean;
	openSidebar: boolean;
	sidebarItem: TSIDEBAR_ITEM;
}

interface DisplayIconProps extends HTMLAttributes<HTMLDivElement> {
	icon: string;
	iconSelected: string;
	className?: string;
	isActive?: boolean;
}

export function DisplayIcon({ icon, iconSelected, isActive, onMouseEnter, onMouseLeave, ...props }: DisplayIconProps) {
	const [hovering, setHovering] = useState(false);
	const handleMouseEnter = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			setHovering(true);
			onMouseEnter?.(event);
		},
		[onMouseEnter]
	);
	const handleMouseLeave = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			setHovering(false);
			onMouseLeave?.(event);
		},
		[onMouseLeave]
	);
	return (
		<DisplayIconContainer onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
			<IconBgImg
				src={
					hovering || isActive
						? '/public/assets/sidebar/icon-border_selected.svg'
						: '/public/assets/sidebar/icon-border_unselected.svg'
				}
			/>
			<IconImg src={hovering ? iconSelected : icon} />
		</DisplayIconContainer>
	);
}

const DisplayIconContainer = styled.div`
	height: 2.75rem;
	width: 2.75rem;
	position: relative;
	cursor: pointer;
`;

const IconBgImg = styled(Img)`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
`;

const IconImg = styled(Img)`
	${cssAbsoluteCenter};
	width: 1.25rem;
	height: 1.25rem;
	z-index: 10;
`;
