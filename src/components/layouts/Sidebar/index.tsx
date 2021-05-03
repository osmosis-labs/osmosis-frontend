import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { Container } from '../../containers';
import { TCardTypes } from '../../../interfaces';
import map from 'lodash-es/map';
import { LAYOUT, TSIDEBAR_ITEM } from '../../../constants';
import { mapKeyValues } from '../../../utils/scripts';
import { SidebarItem } from './SidebarItem';
import { Img } from '../../common/Img';
import { useHistory, withRouter } from 'react-router-dom';
import { History } from 'history';
import { SidebarBottom } from './SidebarBottom';

interface ChildComponentProps {
	history: History;
	/* other props for ChildComponent */
}
const SideBar: FunctionComponent<ChildComponentProps> = ({ history }) => {
	const pathname = history?.location?.pathname;

	const [openSidebar, setOpenSidebar] = React.useState<boolean>(true);
	return (
		<div
			// onMouseEnter={() => setOpenSidebar(true)}
			// onMouseLeave={() => setOpenSidebar(false)}
			className="overflow-x-visible max-w-sidebar-open min-w-sidebar-open pointer-events-none h-full z-50">
			<div className="fixed h-full">
				<Container
					settings={sidebarSettings}
					className={cn(
						'h-full transition-all pointer-events-auto fixed overflow-x-hidden',
						openSidebar ? 'min-w-sidebar-open max-w-sidebar-open' : 'min-w-sidebar-closed max-w-sidebar-closed'
					)}
					type={TCardTypes.CARD}>
					<div className="w-full h-full py-6 px-4 flex flex-col justify-between">
						<div>
							<section className="mb-15 px-1">
								<LogoArea openSidebar={openSidebar} />
							</section>
							<section>
								{mapKeyValues(LAYOUT.SIDEBAR, (_: string, value: TSIDEBAR_ITEM) => (
									<SidebarItem
										key={value.ROUTE}
										selected={value.ROUTE === pathname}
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
	);
};

export const Sidebar = withRouter(SideBar);
const sidebarSettings = {
	hoverable: true,
};

const LogoArea: FunctionComponent<TLogoArea> = ({ openSidebar }) => {
	return (
		<div className="flex items-center">
			<Img className={cn('w-12 h-12')} src={`/public/assets/main/logo-single.png`} />
			<Img
				style={{ maxWidth: openSidebar ? '113px' : '0px' }}
				className={'h-4.5 transition-all'}
				src="/public/assets/main/logo-text.png"
			/>
		</div>
	);
};
interface TLogoArea {
	openSidebar: boolean;
}
