import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Edit from './components/Edit';

function App () {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Login></Login>}></Route>
        <Route exact path="/reg" element={<Register></Register>}></Route>
        <Route exact path="/dashboard" element={<Dashboard></Dashboard>}></Route>
        <Route exact path="/edit" element={<Edit></Edit>}></Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
