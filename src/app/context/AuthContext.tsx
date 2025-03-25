'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  authError: boolean;
}

// Default context with safe values
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: async () => false,
  logout: () => {},
  isLoading: false,
  authError: false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Check if user was previously logged in
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing user data from localStorage', error);
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setAuthError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setUser(data.user);
        // Store user data in localStorage
        try {
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    // Remove user data from localStorage
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
} 