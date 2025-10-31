"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAppSelector } from "@/hooks/redux";
import {
  useChangePasswordMutation,
  useUpdateProfileMutation,
} from "@/slices/auth/auth";
import { logout } from "@/slices/authSlice";
import { useAppDispatch } from "@/hooks/redux";

interface User {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  city?: string;
  state?: string;
  address?: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  getToken: () => string | null;
  updateProfile: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
  }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, accessToken, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const [updateProfileMutation] = useUpdateProfileMutation();
  const [changePasswordMutation] = useChangePasswordMutation();

  const getToken = () => accessToken;

  const updateProfile = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
  }) => {
    try {
      const result = await updateProfileMutation(data).unwrap();
      return {
        success: result.success,
        error: result.success ? undefined : result.message,
      };
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      return {
        success: false,
        error: err?.data?.message || "Failed to update profile",
      };
    }
  };

  const changePassword = async (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    try {
      const result = await changePasswordMutation({
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.newPassword,
      }).unwrap();
      return {
        success: result.success,
        error: result.success ? undefined : result.message,
      };
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      return {
        success: false,
        error: err?.data?.message || "Failed to change password",
      };
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        getToken,
        updateProfile,
        changePassword,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
