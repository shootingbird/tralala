"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoginMutation } from "@/slices/auth/auth";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "@/slices/authSlice";
import { RootState } from "@/lib/store/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import AppWapper from "@/app/AppWapper";

export default function LoginPage() {
  return (
    <AppWapper>
      <LoginPageContent />
    </AppWapper>
  );
}

function LoginPageContent() {
  const [login, { isLoading }] = useLoginMutation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await login(formData).unwrap();

      // Dispatch to store
      dispatch(
        setCredentials({
          user: result.user,
          accessToken: result.token,
          refreshToken: null,
        })
      );

      // Redirect to home or dashboard
      router.push("/");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "data" in err) {
        const errorData = (err as { data?: { message?: string } }).data;
        setError(errorData?.message || "Login failed. Please try again.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <AuthWrapper
      title="Log in to your account"
      subtitle="Sign into your user account to continue"
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="jess@mail.com"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          required
          isPassword={true}
          value={formData.password}
          placeholder="Enter your password"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-blue-600" />
            <span className="ml-2 text-xs text-gray-600">Remember Me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-blue-600 hover:text-blue-500"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#E94B1C] hover:bg-[#E94B1C]/50"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in →"}
        </Button>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <p className="text-center text-sm text-gray-600">
          Don&lsquo;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-500"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthWrapper>
  );
}
