// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginAdmin, loginCustomer, logout } from '~/services/authServices';
import { getAdminProfile, getCustomerProfile, updateCustomerProfile, updateAdminProfile } from '~/services/userServices';

interface UserBase {
  username: string;
  role: string;
  type: 'admin' | 'customer';
  token?: string;
}

interface AdminUser extends UserBase {
  type: 'admin';
  adminId: string;
  fullname: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  branch: string;
}

interface CustomerUser extends UserBase {
  type: 'customer';
  customerId: string;
  fullname: string;
  phone: string;
  email: string;
  gender: string;
  latitude?: number;
  longitude?: number;
}

type User = AdminUser | CustomerUser;

interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string }, type: 'admin' | 'customer') => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        const parsedUser: User = JSON.parse(storedUser);

        try {
          // Lấy thông tin người dùng từ API
          const freshData = parsedUser.type === 'admin'
            ? await getAdminProfile(parsedUser.username)
            : await getCustomerProfile(parsedUser.username);

          setUser({
            ...parsedUser,
            ...freshData
          });
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          // setUser(parsedUser);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }, type: 'admin' | 'customer') => {
    try {
      setLoading(true);
      const apiResponse = type === 'admin'
        ? await loginAdmin(credentials)
        : await loginCustomer(credentials);

      // Auth endpoints return ApiResponse wrapper: { success, status, message, data, timestamp }
      // The actual auth data is inside apiResponse.data
      const { token, username, role } = apiResponse.data;

      // Lưu token vào localStorage trước để interceptor lấy được
      localStorage.setItem('token', token);

      // Lấy thông tin người dùng từ API (lúc này interceptor đã có token)
      const profile = type === 'admin'
        ? await getAdminProfile(username)
        : await getCustomerProfile(username);

      const userData: User = {
        ...profile,
        username,
        role,
        type,
        token
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      // Clear token if profile fetch fails
      localStorage.removeItem('token');

      // Preserve the original error from the backend
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      setLoading(true);
      let updatedProfile;

      if (user.type === 'admin') {
        const currentUsername = user.username;
        updatedProfile = await updateAdminProfile(user.username, data, currentUsername);
      } else {
        updatedProfile = await updateCustomerProfile(user.username, data);
      }

      const updatedUser = {
        ...user,
        ...updatedProfile
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      throw new Error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Chuyển hướng dựa trên loại người dùng
    const redirectPath = user?.type === 'admin' ? '/admin' : '/';
    window.location.href = redirectPath;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout: handleLogout,
      loading,
      updateUserProfile
    }}>
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

export const isCustomerUser = (user: User): user is CustomerUser => user.type === 'customer';
export const isAdminUser = (user: User): user is AdminUser => user.type === 'admin';