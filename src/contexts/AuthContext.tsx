"use client";

import Cookies from "js-cookie";
import React, { createContext, useContext, useState, useEffect } from "react";

import {
  User,
  LoginCredentials,
  AuthResponse,
  SignupCredentials,
  VerifyEmailCredentials,
} from "@/types/user";

/* -----------------------------
   Types
   ----------------------------- */

interface ApiErrorIssue {
  code: string;
  message: string;
  path?: string;
}

interface ApiErrorBody {
  error: {
    code: string;
    message?: string;
    issues?: ApiErrorIssue[];
  };
}

type SimpleResult = { success: true } | { success: false; error: string };

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<SimpleResult>;
  signup: (credentials: SignupCredentials) => Promise<SimpleResult>;
  verifyEmail: (credentials: VerifyEmailCredentials) => Promise<SimpleResult>;
  updateProfile: (profileData: Partial<User>) => Promise<SimpleResult>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  changePassword: (passwords: {
    oldPassword: string;
    newPassword: string;
  }) => Promise<SimpleResult>;
  forgotPassword: (email: string) => Promise<SimpleResult>;
  checkVerificationCode: (code: string, email: string) => Promise<SimpleResult>;
  resendVerificationCode: (email: string) => Promise<SimpleResult>;
  resetPasswordOtp: (
    email: string,
    otp: string,
    new_password: string
  ) => Promise<SimpleResult>;
  getToken: () => string | null;

  resetData: { email: string; otp: string } | null;
  setResetData: React.Dispatch<
    React.SetStateAction<{ email: string; otp: string } | null>
  >;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* -----------------------------
   Helpers
   ----------------------------- */

const isApiErrorBody = (obj: unknown): obj is ApiErrorBody =>
  typeof obj === "object" &&
  obj !== null &&
  "error" in obj &&
  typeof (obj as Record<string, unknown>).error === "object";

const parseApiError = (
  payload: unknown
): { message: string; code?: string; details?: unknown } => {
  const defaultMsg = "An unexpected error occurred.";

  if (typeof payload === "string") {
    return { message: payload, details: payload };
  }

  if (!isApiErrorBody(payload)) {
    return { message: defaultMsg, details: payload };
  }

  const { error } = payload;
  const code = typeof error.code === "string" ? error.code : undefined;

  if (Array.isArray(error.issues) && error.issues.length > 0) {
    const issueMessages = error.issues
      .filter((i) => typeof i?.message === "string")
      .map((i) => i.message);
    if (issueMessages.length > 0) {
      return { message: issueMessages.join(" "), code, details: payload };
    }
  }

  if (typeof error.message === "string") {
    return { message: error.message, code, details: payload };
  }

  return { message: defaultMsg, code, details: payload };
};

const fetchAndParse = async (input: string, init?: RequestInit) => {
  const response = await fetch(input, init);
  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    // fallback to text if the response is not JSON
    parsed = await response.text();
  }
  return { response, parsed } as const;
};

/* -----------------------------
   Provider
   ----------------------------- */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [resetData, setResetData] = useState<{
    email: string;
    otp: string;
  } | null>(null);

  const getToken = () => Cookies.get("token") || null;

  const setUserFromPayload = (payload: unknown) => {
    try {
      if (
        typeof payload === "object" &&
        payload !== null &&
        "user" in payload
      ) {
        const u = (payload as { user: unknown }).user;
        // basic run-time check for minimal shape
        if (typeof u === "object" && u !== null && "email" in u) {
          setUser(u as User);
          Cookies.set("user", JSON.stringify(u), { expires: 70000 });
        }
      }
    } catch (err) {
      // ignore malformed user payload
      console.error("Failed to set user from payload:", err);
    }
  };

  const fetchUserWithToken = async (token: string | null) => {
    if (!token) return null;
    try {
      const { response, parsed } = await fetchAndParse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const parsedErr = parseApiError(parsed);
        console.error("fetchUserWithToken failed:", parsedErr.details);
        return null;
      }

      setUserFromPayload(parsed);
      return parsed;
    } catch (err) {
      console.error("Error fetching user:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    fetchUserWithToken(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -----------------------------
     Auth actions - consistent, simple return shape
     ----------------------------- */

  const login = async (
    credentials: LoginCredentials
  ): Promise<SimpleResult> => {
    try {
      const { response, parsed } = await fetchAndParse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        const parsedErr = parseApiError(parsed);
        console.error("login failed:", parsedErr.details);
        return { success: false, error: parsedErr.message };
      }

      // parsed should match AuthResponse
      const auth = parsed as AuthResponse;
      Cookies.set("token", auth.token, { expires: 70000 });
      setUser(auth.user);
      Cookies.set("user", JSON.stringify(auth.user), { expires: 70000 });

      return { success: true };
    } catch (err) {
      console.error("Network error during login:", err);
      return { success: false, error: "Network error" };
    }
  };

  const signup = async (
    credentials: SignupCredentials
  ): Promise<SimpleResult> => {
    try {
      const { response, parsed } = await fetchAndParse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        const parsedErr = parseApiError(parsed);
        console.error("signup failed:", parsedErr.details);
        return { success: false, error: parsedErr.message };
      }

      return { success: true };
    } catch (err) {
      console.error("Network error during signup:", err);
      return { success: false, error: "Network error" };
    }
  };

  const verifyEmail = async (
    credentials: VerifyEmailCredentials
  ): Promise<SimpleResult> => {
    try {
      const { response, parsed } = await fetchAndParse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        const parsedErr = parseApiError(parsed);
        console.error("verifyEmail failed:", parsedErr.details);
        return { success: false, error: parsedErr.message };
      }

      return { success: true };
    } catch (err) {
      console.error("Network error during verifyEmail:", err);
      return { success: false, error: "Network error" };
    }
  };

  const checkVerificationCode = async (
    code: string,
    email: string
  ): Promise<SimpleResult> => {
    try {
      const { response, parsed } = await fetchAndParse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp: code, email }),
        }
      );

      if (!response.ok) {
        const parsedErr = parseApiError(parsed);
        console.error("verify-otp failed:", parsedErr.details);
        return { success: false, error: parsedErr.message };
      }

      return { success: true };
    } catch (err) {
      console.error("Network error during verify-otp:", err);
      return { success: false, error: "Network error" };
    }
  };

  const resendVerificationCode = async (
    email: string
  ): Promise<SimpleResult> => {
    try {
      const { response, parsed } = await fetchAndParse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const parsedErr = parseApiError(parsed);
        console.error("resend-otp failed:", parsedErr.details);
        return { success: false, error: parsedErr.message };
      }

      return { success: true };
    } catch (err) {
      console.error("Network error during resend-otp:", err);
      return { success: false, error: "Network error" };
    }
  };

  const forgotPassword = async (email: string): Promise<SimpleResult> => {
    try {
      const { response, parsed } = await fetchAndParse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const parsedErr = parseApiError(parsed);
        console.error("forgot-password failed:", parsedErr.details);
        return { success: false, error: parsedErr.message };
      }

      return { success: true };
    } catch (err) {
      console.error("Network error during forgot-password:", err);
      return { success: false, error: "Network error" };
    }
  };

  const changePassword = async (passwords: {
    oldPassword: string;
    newPassword: string;
  }): Promise<SimpleResult> => {
    try {
      const cookieUser = Cookies.get("user");
      const userData = cookieUser
        ? (JSON.parse(cookieUser) as { email?: string })
        : null;

      const { response, parsed } = await fetchAndParse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            email: userData?.email,
            old_password: passwords.oldPassword,
            new_password: passwords.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const parsedErr = parseApiError(parsed);
        console.error("change-password failed:", parsedErr.details);
        return { success: false, error: parsedErr.message };
      }

      return { success: true };
    } catch (err) {
      console.error("Network error during change-password:", err);
      return { success: false, error: "Network error" };
    }
  };

  const resetPasswordOtp = async (
    email: string,
    otp: string,
    new_password: string
  ): Promise<SimpleResult> => {
    try {
      const { response, parsed } = await fetchAndParse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, new_password }),
        }
      );

      if (!response.ok) {
        const parsedErr = parseApiError(parsed);
        console.error("reset-now failed:", parsedErr.details);
        return { success: false, error: parsedErr.message };
      }

      return { success: true };
    } catch (err) {
      console.error("Network error during reset-now:", err);
      return { success: false, error: "Network error" };
    }
  };

  const updateProfile = async (
    profileData: Partial<User>
  ): Promise<SimpleResult> => {
    try {
      const { response, parsed } = await fetchAndParse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      if (!response.ok) {
        const parsedErr = parseApiError(parsed);
        console.error("update-profile failed:", parsedErr.details);
        return { success: false, error: parsedErr.message };
      }

      // update local cache
      const updatedUser = { ...user, ...profileData } as User;
      setUser(updatedUser);
      Cookies.set("user", JSON.stringify(updatedUser), { expires: 70000 });

      return { success: true };
    } catch (err) {
      console.error("Network error during update-profile:", err);
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("token");
    Cookies.remove("user");
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        verifyEmail,
        updateProfile,
        logout,
        resendVerificationCode,
        changePassword,
        forgotPassword,
        checkVerificationCode,
        isAuthenticated: !!user,
        isLoading,
        resetPasswordOtp,
        getToken,

        resetData,
        setResetData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
