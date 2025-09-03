"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData);

    if (result.success) {
      setModalType("success");
      setShowModal(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else {
      setModalType("error");
      setShowModal(true);
    }

    setIsLoading(false);
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

        <Button type="submit" isLoading={isLoading}>
          Sign in →
        </Button>

        {/* disabled the social login for v1 */}
        {/* <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <SocialButton provider="google" label="Sign in with Google" />
                    <SocialButton provider="facebook" label="Sign in with Facebook" />
                    <SocialButton provider="apple" label="Sign in with Apple" />
                </div> */}

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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        title={
          modalType === "success"
            ? "Authentication Successful"
            : "Authentication Failed"
        }
        message={
          modalType === "success"
            ? "Redirecting to homepage..."
            : "Invalid email or password"
        }
        autoClose={modalType === "success"}
        autoCloseTime={2000}
      />
    </AuthWrapper>
  );
}
