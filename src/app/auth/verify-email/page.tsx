"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";
import AppWapper from "@/app/AppWapper";

export default function VerifyEmailPage() {
  return (
    <AppWapper>
      <VerifyEmailPageContent />
    </AppWapper>
  );
}

function VerifyEmailPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { verifyEmail, resendVerificationCode } = useAuth();

  useEffect(() => {
    const lastResend = localStorage.getItem("lastResendTime");
    if (lastResend) {
      const timeLeft =
        30 - Math.floor((Date.now() - parseInt(lastResend)) / 1000);
      if (timeLeft > 0) {
        setCountdown(timeLeft);
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendCode = async () => {
    if (countdown > 0 || !email) return;

    try {
      setIsLoading(true);
      const result = await resendVerificationCode(email);

      if (result.success) {
        localStorage.setItem("lastResendTime", Date.now().toString());
        setCountdown(30);
        setModalType("success");
        setModalMessage("Verification code has been resent to your email");
        setShowModal(true);
      } else {
        setModalType("error");
        setModalMessage(result.error || "Failed to resend code");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Resend failed:", error);
      setModalType("error");
      setModalMessage("Failed to resend verification code");
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await verifyEmail({ email: email!, otp: code });

      if (result.success) {
        setModalType("success");
        setModalMessage("Email verified successfully! Redirecting to login...");
        setShowModal(true);

        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setModalType("error");
        setModalMessage(result.error || "Verification failed");
        setShowModal(true);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setModalType("error");
        setModalMessage(error.message);
      } else {
        setModalType("error");
        setModalMessage("Verification failed");
      }
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper title="Verify Email Address">
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Input
          label="Enter Code"
          type="text"
          placeholder="Enter 6 digit code sent to your email"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Didn&lsquo;t get code?</span>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={countdown > 0 || isLoading}
            className={`text-blue-600 hover:text-blue-500 ${
              countdown > 0 || isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend Code"}
          </button>
        </div>

        <Button type="submit" isLoading={isLoading}>
          Confirm Code
        </Button>
      </form>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        title={
          modalType === "success"
            ? "Verification Successful!"
            : "Verification Failed"
        }
        message={modalMessage}
        autoClose={modalType === "success"}
        autoCloseTime={2000}
      />
    </AuthWrapper>
  );
}
