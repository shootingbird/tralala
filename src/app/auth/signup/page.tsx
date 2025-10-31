"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AppWapper from "@/app/AppWapper";

interface PasswordRequirement {
  label: string;
  isValid: boolean;
}

export default function SignupPage() {
  return (
    <AppWapper>
      <SignupPageContent />
    </AppWapper>
  );
}

function SignupPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordRequirements, setPasswordRequirements] = useState<
    PasswordRequirement[]
  >([
    { label: "Minimum 8 characters", isValid: false },
    { label: "At least one letter", isValid: false },
    { label: "At least one number", isValid: false },
  ]);
  const [isFormValid, setIsFormValid] = useState(false);
  console.log("isformvalid:" + isFormValid);

  const validatePassword = (value: string) => {
    setPassword(value);
    const requirements = [
      { label: "Minimum 8 characters", isValid: value.length >= 8 },
      { label: "At least one letter", isValid: /[a-zA-Z]/.test(value) },
      { label: "At least one number", isValid: /[0-9]/.test(value) },
    ];
    setPasswordRequirements(requirements);

    const allRequirementsMet = requirements.every((req) => req.isValid);
    const passwordsMatch = value === confirmPassword;
    setIsFormValid(allRequirementsMet && passwordsMatch);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    const allRequirementsMet = passwordRequirements.every((req) => req.isValid);
    setIsFormValid(allRequirementsMet && value === password);
  };

  const router = useRouter();
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allRequirementsMet = passwordRequirements.every((req) => req.isValid);
    if (!allRequirementsMet) {
      setModalType("error");
      setModalMessage("Password must meet all requirements");
      setShowModal(true);
      return;
    }

    if (password !== confirmPassword) {
      setModalType("error");
      setModalMessage("Passwords do not match");
      setShowModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    const form = e.target as HTMLFormElement;
    const formData = {
      first_name: `${form.firstName.value}`,
      last_name: `${form.lastName.value}`,
      email: form.email.value,
      password: password,
      phone_number: form.phoneNumber.value,
    };

    try {
      const result = await signup(formData);

      if (result.success) {
        setModalType("success");
        setModalMessage(
          "Your account has been created successfully. Redirecting to verification..."
        );
        setShowModal(true);
        setTimeout(() => {
          router.push(`/auth/verify-email?email=${formData.email}`);
        }, 2000);
      } else {
        setModalType("error");
        setModalMessage(result.error || "Signup failed");
        setShowModal(true);
      }
    } catch (error: unknown) {
      setModalType("error");
      setModalMessage(error instanceof Error ? error.message : "Signup failed");
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="Create Account"
      subtitle="Sign up to enjoy a seamless experience"
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Input
          label="First Name"
          type="text"
          placeholder="Jessica"
          name="firstName"
          required
        />
        <Input
          label="Last Name"
          type="text"
          placeholder="Jackson"
          name="lastName"
          required
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="dom@mail.com"
          required
          name="email"
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+234"
          name="phoneNumber"
          required
        />
        <div className="space-y-6">
          <Input
            label="Password"
            type="password"
            isPassword
            value={password}
            placeholder="Enter your password"
            onChange={(e) => validatePassword(e.target.value)}
            required
            name="password"
          />
          <Input
            label="Confirm Password"
            type="password"
            isPassword
            value={confirmPassword}
            placeholder="Confirm your password"
            onChange={handleConfirmPasswordChange}
            required
            name="confirmPassword"
          />
          <div className="space-y-2">
            {password.length > 0 &&
              passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center text-sm">
                  {req.isValid ? (
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <X className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span
                    className={req.isValid ? "text-green-700" : "text-red-700"}
                  >
                    {req.label}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <Button type="submit" isLoading={isLoading}>
          Create an Account
        </Button>
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* removed social login for mvp1 */}
        {/* <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <SocialButton provider="google" label="Sign up with Google" />
                    <SocialButton provider="facebook" label="Sign up with Facebook" />
                    <SocialButton provider="apple" label="Sign up with Apple" />
                </div> */}

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </form>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        title={modalType === "success" ? "Account Created!" : "Error"}
        message={modalMessage}
        autoClose={modalType === "success"}
        autoCloseTime={2000}
      />
    </AuthWrapper>
  );
}
