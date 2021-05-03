import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { MainPage } from './pages/main';
import { StoreProvider } from './stores';
import { PoolsPage } from './pages/pools';
import { GovernancePage } from './pages/governance';
import { AirdropPage } from './pages/airdrop';
import { RouteWrapper } from './components/layouts/RouteWrapper';
import { NotFoundPage } from './pages/NotFound';
import './styles/index.scss';
import './styles/globals.scss';
import { ModalContainer } from './components/containers/ModalContainer';

const Router: FunctionComponent = () => {
	return (
		<StoreProvider>
			<ModalContainer />
			<div className="min-h-sidebar-minHeight min-w-screen-lg h-screen bg-background z-0">
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
						<Route exact path="/governance">
							<RouteWrapper>
								<GovernancePage />
							</RouteWrapper>
						</Route>
						<Route exact path="/airdrop">
							<RouteWrapper>
								<AirdropPage />
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
		</StoreProvider>
	);
};

ReactDOM.render(<Router />, document.getElementById('app'));
