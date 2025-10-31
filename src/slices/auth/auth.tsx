import {
  SignupRequest,
  LoginRequest,
  ChangePasswordRequest,
  RequestOtpRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  VerifyAccountRequest,
  User,
  AuthResponse,
  LoginResponse,
  ResendOtpResponse,
} from "@/types/auth";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authApiSlice = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  }),
  endpoints: (builder) => ({
    signup: builder.mutation<AuthResponse<User>, SignupRequest>({
      query: (body) => ({
        url: "/api/auth/signup",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
    }),
    changePassword: builder.mutation<AuthResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: "/api/auth/change-password",
        method: "PATCH",
        body,
      }),
    }),
    requestOtp: builder.mutation<ResendOtpResponse, RequestOtpRequest>({
      query: ({ email }) => ({
        url: "/api/auth/resend-otp",
        method: "POST",
        body: { email },
      }),
    }),
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: "/api/auth/verify-email",
        method: "POST",
        body: {
          email: body.email,
          otp: body.code,
        },
      }),
    }),
    resetPassword: builder.mutation<AuthResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    verifyAccount: builder.mutation<AuthResponse<User>, VerifyAccountRequest>({
      query: (body) => ({
        url: "/api/auth/verify-email",
        method: "POST",
        body: {
          email: body.email,
          otp: body.code,
        },
      }),
    }),
    updateLastActive: builder.mutation<AuthResponse, string>({
      query: (userId) => ({
        url: `/api/auth/${userId}/update-account-last-active-date`,
        method: "PATCH",
      }),
    }),
    verifyPadiCode: builder.query<
      { success: boolean; message: string; data: unknown },
      string
    >({
      query: (padiCode) => ({
        url: `/api/payment/${padiCode}/verify-padi-code`,
        method: "GET",
      }),
    }),
    updateProfile: builder.mutation<
      AuthResponse,
      {
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
        address: string;
      }
    >({
      query: (body) => ({
        url: "/api/auth/update-profile",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useChangePasswordMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useVerifyAccountMutation,
  useUpdateLastActiveMutation,
  useVerifyPadiCodeQuery,
  useUpdateProfileMutation,
} = authApiSlice;
