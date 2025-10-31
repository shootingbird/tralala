// Auth Types

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RequestOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  code: string;
  email: string;
}

export interface ResetPasswordRequest {
  code: string;
  email: string;
  otpType: "forgot_password";
  newPassword: string;
}

export interface VerifyAccountRequest {
  code: string;
  email: string;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  accountVerified: boolean;
  phone: string;
  status: string;
  userType: string;
  lastActiveDate: string;
  hasDoneFirstLogin: boolean;
  withdrawalStatus: string;
  wallet: string;
  createdAt: string;
  updatedAt: string;
  padiCode: string;
  id: string;
}

export interface loggedInUser {
  address: string;
  email: string;
  id: string | number;
  phone_number: string;
  user: string;
}

export interface AuthResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  timestamp: string;
  traceId: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: loggedInUser;
}

export interface ResendOtpResponse {
  email_sent: boolean;
  message: string;
  resend_after_sec: number;
}
