import React from 'react';
import ReactDOM from 'react-dom';
import Room from './client/room';
import Lobby from './client/lobby';

ReactDOM.render(
  <React.StrictMode>
    {process.env.REACT_APP_LOCAL ? <Room /> : <Lobby />}
  </React.StrictMode>,
  document.getElementById('root')
);
