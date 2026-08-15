import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { loginApi, registerApi, fetchMeApi, logoutApi, updateProfileApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshTokenStr: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: UserRole, organization?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (fullName?: string, organization?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'echochain_access_token';
const REFRESH_KEY = 'echochain_refresh_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [refreshTokenStr, setRefreshTokenStr] = useState<string | null>(localStorage.getItem(REFRESH_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const mapApiUser = (u: any): User => ({
    id: u.id,
    email: u.email,
    fullName: u.full_name || u.fullName || '',
    role: u.role as any,
    organization: u.organization,
    isActive: u.is_active ?? u.isActive ?? true,
    isVerified: u.is_verified ?? u.isVerified ?? false,
    createdAt: u.created_at || u.createdAt || new Date().toISOString(),
  });

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        try {
          const userData = await fetchMeApi(storedToken);
          setUser(mapApiUser(userData));
          setToken(storedToken);
        } catch (e) {
          console.warn('Session expired or invalid token:', e);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_KEY);
          setToken(null);
          setRefreshTokenStr(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await loginApi(email, password);
      const accToken = data.access_token;
      const refToken = data.refresh_token;

      localStorage.setItem(TOKEN_KEY, accToken);
      localStorage.setItem(REFRESH_KEY, refToken);

      setToken(accToken);
      setRefreshTokenStr(refToken);

      const profile: User = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.full_name,
        role: data.user.role as UserRole,
        organization: data.user.organization,
        isActive: data.user.is_active,
        isVerified: data.user.is_verified,
        createdAt: data.user.created_at,
      };
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    organization?: string
  ) => {
    setIsLoading(true);
    try {
      const data = await registerApi(email, password, fullName, role, organization);
      const accToken = data.access_token;
      const refToken = data.refresh_token;

      localStorage.setItem(TOKEN_KEY, accToken);
      localStorage.setItem(REFRESH_KEY, refToken);

      setToken(accToken);
      setRefreshTokenStr(refToken);

      const profile: User = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.full_name,
        role: data.user.role as UserRole,
        organization: data.user.organization,
        isActive: data.user.is_active,
        isVerified: data.user.is_verified,
        createdAt: data.user.created_at,
      };
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      await logoutApi(token, refreshTokenStr || undefined);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setToken(null);
    setRefreshTokenStr(null);
    setUser(null);
  };

  const updateProfile = async (fullName?: string, organization?: string) => {
    if (!token) return;
    const updated = await updateProfileApi(token, fullName || '', organization);
    setUser(mapApiUser(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshTokenStr,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
