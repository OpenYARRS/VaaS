import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Login from './Login/Login';
import Home from './Home/Home';
import Register from './Login/Register';
import Admin from './Admin/Admin';
import Module from './Cards/Module';
import { Get } from '../Services';
import { apiRoute } from '../utils';
import { setTitle } from '../Store/actions';

// Top-Level App Component

const App = () => {
  // Navigate hook for redirecting
  const navigate = useNavigate();
  // Dispatch hook for accessing the Redux store
  const dispatch = useDispatch();
  // Location hook for getting the current URL
  const location = useLocation();

  // Each time the location changes, execute these effects
  useEffect(() => {
    // Navigate to the login page if the user is not logged in and not on the login/registration page
    if (
      !localStorage.getItem('token') &&
      location.pathname !== '/' &&
      location.pathname !== '/register'
    ) {
      navigate('/');
    }
    // Navigate to the home page if a JWT token is present
    if (localStorage.getItem('token')) {
      const verified = async () => {
        try {
          // Verify the JWT token via the backend
          const res = await Get(apiRoute.getRoute('auth'), {
            authorization: localStorage.getItem('token'),
          });
          if (res.invalid) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            navigate('/');
          }
          // if auth is not invalid and we are on login page or register => redirect to home page
          if (
            !res.invalid &&
            (location.pathname === '/' || location.pathname === '/register')
          ) {
            navigate('/home');
          }
        } catch (err) {
          console.log(err);
        }
      };
      verified();
    }
    dispatch(setTitle(location.pathname.replace('/', '').toUpperCase()));
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/module" element={<Module />} />
    </Routes>
  );
};

export default App;
