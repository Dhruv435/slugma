// File: user/components/ProtectedRoute.jsx

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, logout, checkUserExists } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyUserAndRedirect = async () => {
      if (!isAuthenticated) {
        console.log('ProtectedRoute: Not authenticated, redirecting to login.');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      if (!user || !user._id) {
        console.log('ProtectedRoute: User object incomplete, logging out and redirecting.');
        logout('You are logged out, try again to login.');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      const exists = await checkUserExists(user._id);
      if (!exists) {
        console.log('ProtectedRoute: User account deleted, logging out and redirecting.');
        logout('You are logged out, try again to login.');
        navigate('/login', { state: { from: location.pathname } });
      }
    };

    verifyUserAndRedirect();

  }, [isAuthenticated, user, navigate, logout, checkUserExists, location]);

  return isAuthenticated && user && user._id ? children : null;
};

export default ProtectedRoute;
