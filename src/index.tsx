import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { MainPage } from './pages/main';
import { StoreProvider } from './stores';
import { PoolsPage } from './pages/pools';
import { AirdropPage } from './pages/airdrop';
import { RouteWrapper } from './components/layouts/RouteWrapper';
import { NotFoundPage } from './pages/NotFound';

import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/index.scss';
import './styles/globals.scss';
import { PoolPage } from './pages/pool';
import { AssetsPage } from './pages/assets';
import { GovernancePage } from './pages/governance';
import { Bounce, ToastContainer } from 'react-toastify';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { GovernanceDetailsPage } from './pages/governance/[id]/GovernanceDetailsPage';
import { BootstrapPage } from './pages/bootstrap';
import { ToastProvider } from './components/common/toasts';
import { Terms } from './terms';
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);

const Router: FunctionComponent = () => {
	return (
		<StoreProvider>
			<ToastProvider>
				<Terms />
				<div style={{ minWidth: '1280px' }} className="min-h-sidebar-minHeight h-screen bg-background z-0">
					<BrowserRouter>
						<Switch>
							<Route exact path="/">
								<RouteWrapper>
									<MainPage />
								</RouteWrapper>
							</Route>
							<Route exact path="/pools">
								<RouteWrapper>
									<PoolsPage />
								</RouteWrapper>
							</Route>
							<Route path="/pool/:id">
								<RouteWrapper>
									<PoolPage />
								</RouteWrapper>
							</Route>
							<Route exact path="/assets">
								<RouteWrapper>
									<AssetsPage />
								</RouteWrapper>
							</Route>
							<Route exact path="/governance">
								<RouteWrapper>
									<GovernancePage />
								</RouteWrapper>
							</Route>
							<Route exact path="/governance/:id">
								<RouteWrapper>
									<GovernanceDetailsPage />
								</RouteWrapper>
							</Route>
							<Route exact path="/airdrop">
								<RouteWrapper>
									<AirdropPage />
								</RouteWrapper>
							</Route>
							<Route exact path={'/bootstrap'}>
								<RouteWrapper>
									<BootstrapPage />
								</RouteWrapper>
							</Route>
							<Route>
								<RouteWrapper>
									<NotFoundPage />
								</RouteWrapper>
							</Route>
						</Switch>
					</BrowserRouter>
				</div>
				<ToastContainer transition={Bounce} />
			</ToastProvider>
		</StoreProvider>
	);
};

ReactDOM.render(<Router />, document.getElementById('app'));
