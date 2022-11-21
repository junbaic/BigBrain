import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { loadAuthorization, showLogs } from './utils/http';

showLogs();
// keep auth when refresh
loadAuthorization();

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);
