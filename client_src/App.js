import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import logo from './logo.svg';
import './App.css';
import Map from './components/Map/Map';
import Users from './components/Users/Users';
import DateJsonMaker from './components/Test/DateJsonMaker';

function App() {

  return (
    <div>
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
          <Map />
        </Route>
        <Route path="/users">
          <Users />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
