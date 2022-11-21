import axios from 'axios';
import config from '../config.json';
import { showToast } from './utils';

let log = false;

export const showLogs = () => {
  log = true;
};

const AUTH_STORAGE_KEY = 'authorization';
const SESSION_STORAGE_KEY = 'session';

const http = axios.create({
  baseURL: `http://localhost:${config.BACKEND_PORT}/`,
  headers: {
    'Content-Type': 'application/json'
  },
});

http.interceptors.request.use(data => {
  if (log) {
    console.log(`%c[request ${data.method}] ${data.url}`, 'color:cyan', data.data);
  }
  return data;
})

http.interceptors.response.use(data => {
  if (log) {
    console.log(`%c[response ${data.config.method}] ${data.config.url}`, 'color:orange', data.data);
  }
  return data;
}, error => {
  if (error.response.data.error) {
    showToast(error.response.data.error);
  }
  return Promise.reject(error);
})

let loginName = null //

export const saveLoginData = ({ name, token }) => {
  loginName = name;
  setAuthorization(token);
}

export const clearLoginData = () => {
  loginName = null
  setAuthorization(null);
}

export const getLoginName = () => loginName;

const setAuthorization = (token) => {
  if (token === null) {
    axios.defaults.headers.common.Authorization = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    const authorization = `Bearer ${token}`
    http.defaults.headers.common.Authorization = authorization;
    localStorage.setItem(AUTH_STORAGE_KEY, authorization);
  }
}

/**
 * keep login state when refresh
 */
export const loadAuthorization = () => {
  const val = localStorage.getItem(AUTH_STORAGE_KEY);
  if (val) {
    http.defaults.headers.common.Authorization = val;
  }
}

/**
 * save player id in order to keep status
 * when refresh brower during game
 */
const saveSession = (sessionId, playerId) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    playerId, sessionId,
  }))
};
const getSavedSession = () => {
  const data = localStorage.getItem(SESSION_STORAGE_KEY);
  return JSON.parse(data);
}
const removeSavedSession = () => localStorage.removeItem(SESSION_STORAGE_KEY);

export const SessionStorage = {
  save: saveSession,
  get: getSavedSession,
  remove: removeSavedSession,
}

window.http = http;

export default http;
