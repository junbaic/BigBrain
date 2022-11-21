import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http, { saveLoginData } from '../utils/http';
import { showToast } from '../utils/utils';
import PropTypes from 'prop-types';

function Register (props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const nav = useNavigate();

  const onRegister = async () => {
    try {
      if (!email || !password || !name) {
        showToast('invalid input!');
        return
      }
      const resp = await http.post('/admin/auth/register', { email, password, name });
      if (resp.status === 200) {
        saveLoginData({ name, token: resp.data.token })
        nav('/dashboard');
      } else {
        console.error('register failed');
      }
    } catch (e) {
      console.error('register error');
      console.error(e);
    }
  }

  return <div className='flex flex-col justify-center items-center w-screen h-screen'>
    <div className='w-72 max-w-2xl'>
      <div className='rounded-md shadow-sm -space-y-px'>
        <input
          type={'text'}
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='Please input your email'
          className='input rounded-t-md'
          role="email"/>
        <input
          type={'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder='Please input your password'
          className='input'
          role="password"/>
        <input
          type={'text'}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='Please input your name'
          className='input rounded-b-md'
          role="name"/>
      </div>
      <div className='flex mt-3'>
        <button className='group button w-2/3 bg-green-600 hover:bg-green-700 focus:ring-green-500' onClick={props.onRegister || onRegister}>Register</button>
        <button className='group button ml-1 w-1/3 flex-1 bg-indigo-400 hover:bg-indigo-500 focus:ring-indigo-600' onClick={() => nav('/')}>Login</button>
      </div>
    </div>
  </div>
}

Register.propTypes = {
  onRegister: PropTypes.func,
}

export default Register;
