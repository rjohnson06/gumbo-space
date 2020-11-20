import React from 'react';
import {
  Switch,
  Route,
  Link
} from "react-router-dom";

import './App.css';
import classes from './App.module.css';
import Main from './components/Main/Main';
import Users from './components/Users/Users';
import GlobalConfigContext from './contexts/GlobalConfig/GlobalConfig';

function App() {

  //<GlobalConfigContext.Provider value={{ apiUrl: "http://localhost:3000" }}>
  //</GlobalConfigContext.Provider>

  return (
    <div className={classes.App}>
      <nav>
        <ul>
          <li>
            <Link to="/">Map</Link>
          </li>
          <li>
            <Link to="/users">Users</Link>
          </li>
        </ul>
      </nav>

      <Switch>
        <Route exact path="/">
          <Main />
        </Route>
        <Route path="/users">
          <Users />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
