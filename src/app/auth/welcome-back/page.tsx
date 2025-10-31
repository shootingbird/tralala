"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import Image from "next/image";
import Link from "next/link";
import AppWapper from "@/app/AppWapper";

export default function WelcomeBackPage() {
  return (
    <AppWapper>
      <WelcomeBackPageContent />
    </AppWapper>
  );
}

function WelcomeBackPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // TODO: Add authentication logic here

      // Show success modal
      setShowSuccessModal(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <Image
            src="/avatar.png"
            alt="User Avatar"
            width={80}
            height={80}
            className="mx-auto rounded-full border-4 border-white shadow-lg"
          />
          <h1 className="text-lg md:text-xl font-semibold">
            Welcome Back, Jessica! 👋
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Input
              type={"password"}
              placeholder="Enter your password"
              className="pr-12"
              isPassword={true}
            />
          </div>

          <Button type="submit" isLoading={isLoading}>
            Sign in →
          </Button>

          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot Your Password?
            </Link>
          </div>
        </form>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Welcome Back!"
        message="Login successful. Redirecting to dashboard..."
        autoClose
        autoCloseTime={2000}
      />
    </AuthWrapper>
  );
}
