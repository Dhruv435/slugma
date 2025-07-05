// File: user/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useRef } from 'react'; // Import useRef

// Create Auth Context
export const AuthContext = createContext(null);

// Custom hook to use the Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('loggedInUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  // Initialize authMessage from sessionStorage for persistence across refreshes
  const [authMessage, setAuthMessage] = useState(() => {
    try {
      const storedMessage = sessionStorage.getItem('authMessage');
      return storedMessage || null;
    } catch (error) {
      console.error("Failed to read authMessage from sessionStorage", error);
      return null;
    }
  });

  // Ref to store the interval ID for cleanup
  const intervalRef = useRef(null); // Re-added useRef

  // API Base URL
  const API_BASE_URL = 'http://localhost:3001';

  // Effect to update localStorage whenever user state changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('loggedInUser');
      }
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }, [user]);

  // Effect to update sessionStorage whenever authMessage state changes
  useEffect(() => {
    try {
      if (authMessage) {
        sessionStorage.setItem('authMessage', authMessage);
      } else {
        sessionStorage.removeItem('authMessage');
      }
    } catch (error) {
      console.error("Failed to save authMessage to sessionStorage", error);
    }
  }, [authMessage]);

  // --- RE-INTRODUCING THE PERIODIC CHECK ---
  useEffect(() => {
    // Clear any existing interval when user state changes or component unmounts
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (user && user._id) {
      // Set up a new interval to check user existence every 15-30 seconds (adjust as needed)
      // 20000 milliseconds = 20 seconds
      intervalRef.current = setInterval(async () => {
        console.log('Periodic check: Checking user existence...');
        const exists = await checkUserExists(user._id);
        if (!exists) {
          console.log('Periodic check: User account no longer exists. Logging out.');
          // Use the desired message
          logout('You are logged out, try again to login.');
        }
      }, 20000); // Check every 20 seconds

      // Also perform an immediate check on mount/user change
      const initialCheck = async () => {
        console.log('Immediate check: Checking user existence on user change/mount...');
        const exists = await checkUserExists(user._id);
        if (!exists) {
          console.log('Immediate check: User account no longer exists. Logging out.');
          logout('You are logged out, try again to login.');
        }
      };
      initialCheck(); // Run immediate check
    }

    // Cleanup function: clear the interval when the component unmounts or dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user]); // Re-run this effect when the user object changes


  const login = async (username, password) => {
    try {
      setAuthMessage(null); // Clear any previous messages on new login attempt
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user); // Set the user data from the response
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const signup = async (username, password, age, mobileNumber) => {
    try {
      setAuthMessage(null); // Clear any previous messages on new signup attempt
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, age, mobileNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = (message = null) => {
    setUser(null); // Clear user state
    if (message) {
      setAuthMessage(message); // Set the message to be displayed globally
    }
    console.log('User logged out.');
  };

  const clearAuthMessage = () => {
    setAuthMessage(null);
  };

  const checkUserExists = async (userId) => {
    if (!userId) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      return response.ok; // Returns true if user found (status 200), false otherwise (e.g., 404)
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false; // Assume not found/error if fetch fails
    }
  };

  const authContextValue = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    checkUserExists,
    authMessage,
    clearAuthMessage
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};