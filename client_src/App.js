import React from 'react';
import logo from './logo.svg';
import './App.css';
import Map from './components/Map/Map';
import DateJsonMaker from './components/Test/DateJsonMaker';

function App() {

  /*
  return (
    <div className="App">
      <h1>TEST</h1>
      <Map />
      <DateJsonMaker />
    </div>
  );
  */

  return (
    <div className="App">
      <DateJsonMaker />
    </div>
  );
}

export default App;
