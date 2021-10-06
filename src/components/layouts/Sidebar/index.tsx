import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { Container } from '../../containers';
import { TCardTypes } from '../../../interfaces';
import { LAYOUT, TSIDEBAR_ITEM, TSIDEBAR_SELECTED_CHECK } from '../../../constants';
import { mapKeyValues } from '../../../utils/scripts';
import { SidebarItem } from './SidebarItem';
import { useHistory, withRouter } from 'react-router-dom';
import { SidebarBottom } from './SidebarBottom';
import isArray from 'lodash-es/isArray';

const SideBar: FunctionComponent = () => {
	const history = useHistory();
	const pathname = history?.location?.pathname;

	const [isOpenSidebar, setIsOpenSidebar] = React.useState<boolean>(false);

	const [isOnTop, setIsOnTop] = React.useState<boolean>(true);

	React.useEffect(() => {
		const checkAndSetWindowIsOnTop = () => {
			const newIsOnTop = window.scrollY === 0;
			setIsOnTop(newIsOnTop);
		};

		window.addEventListener('scroll', checkAndSetWindowIsOnTop);
		checkAndSetWindowIsOnTop();

		return () => window.removeEventListener('scroll', checkAndSetWindowIsOnTop);
	}, []);

	React.useEffect(() => {
		if (isOpenSidebar) {
			document.body.style.height = '100%';
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.height = '';
			document.body.style.overflow = 'scroll';
		}
	}, [isOpenSidebar]);

	return (
		<React.Fragment>
			{isOpenSidebar && <div className="absolute z-10 w-full h-full bg-black bg-opacity-50 md:hidden" />}
			<div
				className={`w-full overflow-x-visible max-w-sidebar-open min-w-sidebar-open pointer-events-none h-full z-50 absolute md:relative ${
					isOpenSidebar ? 'block' : 'hidden'
				} md:block`}>
				<div className="fixed h-full">
					<Container
						className={cn(
							'h-full transition-all pointer-events-auto fixed overflow-x-hidden min-w-sidebar-open max-w-sidebar-open'
						)}
						type={TCardTypes.CARD}>
						<div className="w-full h-full p-5 md:py-6 flex flex-col justify-between">
							<div>
								<section className="mb-15 flex flex-row items-center">
									<div className="flex items-center">
										<img
											className="cursor-pointer h-10 md:h-12 mr-4"
											src="/public/assets/main/osmosis-logo-main.svg"
											alt="osmosis logo"
										/>
									</div>
								</section>
								<section>
									{mapKeyValues(LAYOUT.SIDEBAR, (_: string, value: TSIDEBAR_ITEM) => (
										<SidebarItem
											key={value.TEXT}
											selected={pathnameCheck(pathname, value.SELECTED_CHECK)}
											sidebarItem={value}
										/>
									))}
								</section>
							</div>
							<div>
								<SidebarBottom />
							</div>
						</div>
					</Container>
				</div>
			</div>
			<div
				className={`fixed z-10 top-0 left-0 p-5 md:py-6 w-full flex justify-between items-center md:hidden bg-black ${
					!isOnTop ? 'bg-opacity-75' : 'bg-opacity-0'
				} transition-colors duration-500`}>
				<img
					className="h-10 md:h-12"
					src="/public/assets/main/osmosis-logo-main.svg"
					alt="osmosis-logo"
					onClick={() => history.push('/')}
				/>
				<img
					className="h-10 -mr-2.5"
					src={`/public/assets/Icons/${isOpenSidebar ? 'Close' : 'Menu'}.svg`}
					alt="hamburger menu"
					onClick={() => setIsOpenSidebar(!isOpenSidebar)}
				/>
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
