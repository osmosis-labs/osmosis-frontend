import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import '../../styles/index.scss';
import '../../styles/globals.scss';
import { SideBar } from '../../components/layouts/sidebar';

export const MainPage: FunctionComponent = observer(() => {
	// TODO : load data where data is needed, not here - move to relevant parts of the app
	const { chainStore, accountStore } = useStore();

	const accountInfo = accountStore.getAccount(chainStore.current.chainId);

	return (
		<div className="h-full w-full min-w-screen-md lg:min-w-screen-lg min-h-sidebar-minHeight">
			<SideBar />
		</div>
	);
});
