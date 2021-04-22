import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";
import { MainPage } from "./pages/main";
import { StoreProvider } from "./stores";
import { TestPage } from "./pages/test";

const Router: FunctionComponent = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Route exact path="/">
          <MainPage />
        </Route>
        <Route exact path="/test">
          <TestPage />
        </Route>
      </HashRouter>
    </StoreProvider>
  );
};

ReactDOM.render(<Router />, document.getElementById("app"));
