import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';
import { MainPage } from './pages/main';
import { StoreProvider } from 'src/stores';

const Router: FunctionComponent = () => {
	return (
		<StoreProvider>
			<HashRouter>
				<Route exact path="/">
					<MainPage />
				</Route>
			</HashRouter>
		</StoreProvider>
	);
};

ReactDOM.render(<Router />, document.getElementById('app'));
