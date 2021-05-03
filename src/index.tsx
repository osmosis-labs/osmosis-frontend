import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { MainPage } from './pages/main';
import { StoreProvider } from './stores';
import { PoolsPage } from './pages/pools';
import { GovernancePage } from './pages/governance';
import { AirdropPage } from './pages/airdrop';
import { RouteWrapper } from './components/layouts/RouteWrapper';
import { NotFoundPage } from './pages/NotFound';
import { TestPage } from './pages/test';

const Router: FunctionComponent = () => {
	return (
		<StoreProvider>
			<div className="min-h-sidebar-minHeight min-w-screen-lg h-screen bg-background">
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
						<Route exact path="/test">
							<RouteWrapper>
								<TestPage />
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
