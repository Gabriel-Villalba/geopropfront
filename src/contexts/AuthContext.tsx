import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import type { User, LoginCredentials, RegisterCredentials } from '../types';
import { authApi, meApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterCredentials) => Promise<User>;
  updateUser: (nextUser: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      setIsLoading(false);
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    const syncMe = async () => {
      try {
        const me = await meApi.getMe();
        setUser(me);
        localStorage.setItem('user', JSON.stringify(me));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void syncMe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);

    try {
      const response = await authApi.login(credentials);
      localStorage.setItem('token', response.token);
      try {
        const me = await meApi.getMe();
        localStorage.setItem('user', JSON.stringify(me));
        setUser(me);
      } catch {
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterCredentials) => {
    setIsLoading(true);

    try {
      const response = await authApi.register(payload);
      localStorage.setItem('token', response.token);
      try {
        const me = await meApi.getMe();
        localStorage.setItem('user', JSON.stringify(me));
        setUser(me);
        return me;
      } catch {
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return response.user;
      }
    } finally {
      setIsLoading(false);
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (nextUser: User) => {
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
