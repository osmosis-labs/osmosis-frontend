import React, { FunctionComponent, useEffect } from 'react';
import cn from 'clsx';
import { Container } from '../../containers';
import { TCardTypes } from '../../../interfaces';
import map from 'lodash-es/map';
import { LAYOUT, TSIDEBAR_ITEM, TSIDEBAR_SELECTED_CHECK } from '../../../constants';
import { mapKeyValues } from '../../../utils/scripts';
import { SidebarItem } from './SidebarItem';
import { Img } from '../../common/Img';
import { useHistory, withRouter } from 'react-router-dom';
import { History } from 'history';
import { SidebarBottom } from './SidebarBottom';
import isArray from 'lodash-es/isArray';
import { useWindowScroll } from 'react-use';

interface ChildComponentProps {
	history: History;
	/* other props for ChildComponent */
}
const SideBar: FunctionComponent<ChildComponentProps> = ({ history }) => {
	const pathname = history?.location?.pathname;

	const [openSidebar, setOpenSidebar] = React.useState<boolean>(true);

	return (
		<React.Fragment>
			<div
				className={`overflow-x-visible max-w-sidebar-open min-w-sidebar-open pointer-events-none h-full z-50 absolute md:block ${
					openSidebar ? 'block' : 'hidden'
				}`}>
				<div className="fixed h-full">
					<Container
						className={cn('h-full transition-all pointer-events-auto fixed overflow-x-hidden')}
						type={TCardTypes.CARD}>
						<div className="w-full h-full py-6 px-4 flex flex-col justify-between">
							<div>
								<section className="mb-15 flex flex-row items-center">
									<div className="px-1">
										<LogoArea openSidebar={openSidebar} />
									</div>
									<div className="ml-2 mt-1" onClick={() => setOpenSidebar(false)}>
										<img className="w-9" src="/public/assets/Icons/Close.svg" />
									</div>
								</section>
								<section>
									{mapKeyValues(LAYOUT.SIDEBAR, (_: string, value: TSIDEBAR_ITEM) => (
										<SidebarItem
											key={value.TEXT}
											selected={pathnameCheck(pathname, value.SELECTED_CHECK)}
											openSidebar={openSidebar}
											sidebarItem={value}
										/>
									))}
								</section>
							</div>
							<div>
								<SidebarBottom openSidebar={openSidebar} />
							</div>
						</div>
					</Container>
				</div>
			</div>
			<div
				className="block absolute md:hidden z-10 bg-card rounded-lg px-0.25 pt-0.75 top-3.5 left-2.5 border border-white-faint"
				onClick={() => setOpenSidebar(true)}>
				<img className="h-15" src="/public/assets/main/logo-single.png" alt="osmosis-logo" />
			</div>
		</React.Fragment>
	);
};
const pathnameCheck = (str: string, routes: TSIDEBAR_SELECTED_CHECK) => {
	if (isArray(routes)) {
		for (const route of routes) {
			if (route instanceof RegExp) {
				if (route.test(str)) return true;
			} else if ((route as string) === str) return true;
		}
	} else {
		if (str === (routes as string)) return true;
	}
	return false;
};

export const Sidebar = withRouter(SideBar);

const LogoArea: FunctionComponent<TLogoArea> = ({ openSidebar }) => {
	const history = useHistory();

	return (
		<div className="flex items-center">
			<img
				className="cursor-pointer"
				src="/public/assets/main/osmosis-logo-main.svg"
				alt="logo"
				onClick={e => {
					e.preventDefault();

					history.push('/');
				}}
			/>
		</div>
	);
};
interface TLogoArea {
	openSidebar: boolean;
}
