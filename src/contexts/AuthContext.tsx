'use client';

import Cookies from 'js-cookie';
import { createContext, useContext, useState, useEffect } from 'react';

import { User, LoginCredentials, AuthResponse, SignupCredentials, VerifyEmailCredentials } from '@/types/user';



interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    signup: (credentials: SignupCredentials) => Promise<{ success: boolean; error?: string }>;
    verifyEmail: (credentials: VerifyEmailCredentials) => Promise<{ success: boolean; error?: string }>;
    updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    changePassword: (passwords: { oldPassword: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    checkVerificationCode: (code: string, email: string) => Promise<{ success: boolean; error?: string }>;
    resendVerificationCode: (email: string) => Promise<{ success: boolean; error?: string }>;
    resetPasswordNow: (email: string, new_password: string) => Promise<{ success: boolean, error?: string }>;
    getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAndUpdateUser = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) return null;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(token)

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch user');
            }

            setUser(data.user);
            Cookies.set('user', JSON.stringify(data.user), { expires: 70000 });
            return data.user;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    };

    const fetchInitialUser = async ({ token }: { token: string }) => {
        try {
            if (!token) return null;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(token)

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch user');
            }

            setUser(data.user);
            Cookies.set('user', JSON.stringify(data.user), { expires: 70000 });
            return data.user;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    };

    useEffect(() => {

        fetchAndUpdateUser();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data: AuthResponse = await response.json();
            console.log(data)

            if (!response.ok) {
                throw new Error((data as { error?: string }).error || 'Login failed');
            }

            Cookies.set('token', data.token, { expires: 70000 });
            Cookies.set('user', JSON.stringify(data.user), { expires: 70000 });
            fetchInitialUser({ token: data.token });

            return { success: true };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return {
                    success: false,
                    error: error.message || 'Failed to send reset email'
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to send reset email'
                };
            }
        }
    };

    const logout = () => {
        setUser(null);
        Cookies.remove('token');
        Cookies.remove('user');
    };

    const signup = async (credentials: SignupCredentials) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            return { success: true };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return {
                    success: false,
                    error: error.message || 'Failed to send reset email'
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to send reset email'
                };
            }
        }
    };

    const verifyEmail = async (credentials: VerifyEmailCredentials) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            return { success: true };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return {
                    success: false,
                    error: error.message || 'Failed to send reset email'
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to send reset email'
                };
            }
        }
    };

    const updateProfile = async (profileData: Partial<User>) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            // Update local user state and cookie
            const updatedUser = { ...user, ...profileData };
            setUser(updatedUser as User);
            Cookies.set('user', JSON.stringify(updatedUser), { expires: 70000 });

            return { success: true };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return {
                    success: false,
                    error: error.message || 'Failed to send reset email'
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to send reset email'
                };
            }
        }
    };

    const changePassword = async (passwords: { oldPassword: string; newPassword: string }) => {
        try {
            const cookieUser = Cookies.get('user');
            const userData = cookieUser ? JSON.parse(cookieUser) : null;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`
                },
                body: JSON.stringify({
                    email: userData?.email,
                    old_password: passwords.oldPassword,
                    new_password: passwords.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update password');
            }

            return { success: true };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return {
                    success: false,
                    error: error.message || 'Failed to send reset email'
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to send reset email'
                };
            }
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send reset email');
            }

            return { success: true };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return {
                    success: false,
                    error: error.message || 'Failed to send reset email'
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to send reset email'
                };
            }
        }
    };

    const resendVerificationCode = async (email: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to resend verification code');
            }

            return { success: true };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return {
                    success: false,
                    error: error.message
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to resend verification code'
                };
            }
        }
    };

    const getToken = () => {
        return Cookies.get('token') || null;
    };

    const checkVerificationCode = async (code: string, email: string) => {
        try {
            console.log("Code: ", code, email)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: code, email: email })
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify OTP');
            }
    
            return { success: true };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return {
                    success: false,
                    error: error.message
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to verify OTP'
                };
            }
        }
    }

const resetPasswordNow = async (email: string, new_password: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-now`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, new_password: new_password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to reset password');
        }

        return { success: true };
    } catch (error: unknown) {
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message
            };
        } else {
            return {
                success: false,
                error: 'Failed to reset password'
            };
        }
    }
}

    return (
        <AuthContext.Provider value={{
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
            resetPasswordNow,
            getToken
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};