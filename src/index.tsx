import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";

const Router: FunctionComponent = () => {
  return (
    <HashRouter>
      <Route exact path="/">
        <div>Hello, world</div>
      </Route>
    </HashRouter>
  );
};

ReactDOM.render(<Router />, document.getElementById("app"));
