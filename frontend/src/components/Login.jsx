import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http, { saveLoginData } from '../utils/http';

function Login () {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const onLogin = async () => {
    try {
      const resp = await http.post('/admin/auth/login', { email, password });
      saveLoginData({ name, token: resp.data.token })
      nav('/dashboard');
    } catch (e) {
      console.error(e);
      console.error('login failed');
    }
  }

  return <div className='flex flex-col justify-center items-center w-screen h-screen'>
    <div className='w-72 max-w-2xl'>
      <div className='rounded-md shadow-sm -space-y-px'>
        <div>
          <input
            type={'text'}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='Please input your email'
            className='input rounded-t-md'
            role='email'/>
        </div>
        <div>
          <input
            type={'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder='Please input your password'
            className='input rounded-b-md'
            role='password'/>
        </div>
      </div>
      <div className='flex mt-3'>
        <button className='group button w-2/3 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' onClick={onLogin}>Login</button>
        <button className='group button ml-1 flex-1 bg-green-400 hover:bg-green-500 focus:ring-green-600' onClick={() => nav('/reg')}>Register</button>
      </div>
    </div>
  </div>
}

export default Login;
