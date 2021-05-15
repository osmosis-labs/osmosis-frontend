import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { Img } from '../../common/Img';
import { TSIDEBAR_ITEM } from '../../../constants';
import { useHistory, NavLink } from 'react-router-dom';

export const SidebarItem: FunctionComponent<TSidebarItem> = ({ sidebarItem, openSidebar, selected }) => {
	return (
		<NavLink exact to={sidebarItem.ROUTE}>
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
			</li>
		</NavLink>
	);
};
interface TSidebarItem {
	selected?: boolean;
	openSidebar: boolean;
	sidebarItem: TSIDEBAR_ITEM;
}

export const DisplayIcon: FunctionComponent<TDisplayIcon> = ({ icon, iconSelected, className, clicked }) => {
	const [hovering, setHovering] = React.useState(false);
	return (
		<div
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
			className={cn('h-11 w-11 relative', className)}>
			<Img
				className="w-full h-full absolute top-0 left-0"
				src={
					hovering || clicked
						? '/public/assets/sidebar/icon-border_selected.svg'
						: '/public/assets/sidebar/icon-border_unselected.svg'
				}
			/>
			<Img className="w-5 h-5 s-position-abs-center z-10" src={hovering ? iconSelected : icon} />
		</div>
	);
};

interface TDisplayIcon {
	icon: string;
	iconSelected: string;
	className?: string;
	clicked?: boolean;
}
