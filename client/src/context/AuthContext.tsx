import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IUser, UserRole } from '../types/index.js';
import { api, setAccessToken } from '../services/api.js';
import { useToast } from './ToastContext.js';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  isProfileModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsDemo: (role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<IUser>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const { showAlert } = useToast();

  // Attempt silent refresh on initial application mount
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const refreshRes = await api.post('/auth/refresh');
        const token = refreshRes.data?.data?.accessToken;
        const userData = refreshRes.data?.data?.user;

        if (token && userData) {
          setAccessToken(token);
          setUser(userData);
        }
      } catch {
        // No active session cookie found - user starts unauthenticated or in demo preview
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateSession();
  }, []);

  // Handle runtime session expiry dispatched by API client when refresh token rejects
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser((prevUser) => {
        if (prevUser) {
          showAlert({
            type: 'warning',
            title: 'Session Expired',
            message: 'Your session has expired. Please log in again to continue.',
          });
        }
        return null;
      });
      setAccessToken(null);
      setIsLoginModalOpen(false);
      setIsProfileModalOpen(false);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [showAlert]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, user: userData } = res.data.data;

      setAccessToken(accessToken);
      setUser(userData);
      setIsLoginModalOpen(false);

      if (res.data.alert) {
        showAlert(res.data.alert);
      }
      return true;
    } catch (error: any) {
      const alert = error.response?.data?.alert || {
        type: 'error',
        title: 'Login Error',
        message: error.message || 'Failed to authenticate.',
      };
      showAlert(alert);
      return false;
    }
  };

  const loginAsDemo = async (): Promise<boolean> => {
    return login('admin@gmail.com', 'Pass@123');
  };

  const updateProfile = async (profileData: Partial<IUser>): Promise<boolean> => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data?.success && res.data?.data) {
        setUser(res.data.data);
        if (res.data.alert) {
          showAlert(res.data.alert);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      const alert = error.response?.data?.alert || {
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Could not update user profile.',
      };
      showAlert(alert);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const res = await api.post('/auth/logout');
      if (res.data?.alert) {
        showAlert(res.data.alert);
      }
    } catch {
      // ignore logout network errors
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsProfileModalOpen(false);
    }
  };

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);
  const openProfileModal = useCallback(() => setIsProfileModalOpen(true), []);
  const closeProfileModal = useCallback(() => setIsProfileModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isLoginModalOpen,
        isProfileModalOpen,
        openLoginModal,
        closeLoginModal,
        openProfileModal,
        closeProfileModal,
        login,
        loginAsDemo,
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
