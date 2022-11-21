import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Edit from './components/Edit';
import Game from './components/Game';
import Result from './components/Result';
import History from './components/History';

function App () {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Login/>}></Route>
        <Route exact path="/reg" element={<Register/>}></Route>
        <Route exact path="/dashboard" element={<Dashboard/>}></Route>
        <Route exact path="/edit" element={<Edit/>}></Route>
        <Route exact path="/game/:id" element={<Game/>}></Route>
        <Route exact path="/result/:id" element={<Result/>}></Route>
        <Route exact path="/history/:id" element={<History/>}></Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
