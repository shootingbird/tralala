'use client';

import { useState } from 'react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState<string>('')
    const [otpCheckSuccess, setOtpCheckSuccess] = useState<boolean>(false);
    const [correctOtp, setcorrectOtp] = useState<boolean>(false)
    const router = useRouter();
    const { forgotPassword, checkVerificationCode } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const result = await forgotPassword(email);
            console.log("Results: ", result)
            if (result.success) {
                setSuccess('Password reset OTP has been sent to your email.');
            } else {
                setError(result.error || 'Failed to send reset email');
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message || 'Failed to send reset email');
            } else {
                setError('Failed to send reset email');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckCode = async (e: React.FormEvent) => {
        e.preventDefault(); // Add this line to prevent form reload
        setIsLoading(true); // Add this line to show loading state
        setError(null); // Clear previous errors
        
        try{
            console.log("Email and OTP: ", otpCode, email)
            const response = await checkVerificationCode(otpCode, email);
            if (response.success) {
                setcorrectOtp(true);
                setSuccess('OTP code is correct.');
                // Optionally, redirect after a delay
                setTimeout(() => {
                    router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
                }, 2000);
            } else {
                setError(response.error || 'Failed to verify OTP');
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message || 'Failed to verify OTP');
            } else {
                setError('Failed to verify OTP');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthWrapper
            title="Reset Account Password 🔒"
            subtitle="Enter your email address"
        >
            <form onSubmit={success !== null ? handleCheckCode : handleSubmit} className="mt-8 space-y-6">
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="jess@mail.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                {success !== null && (
                    <Input
                    label="OTP Code"
                    type="number"
                    placeholder="123456"
                    required
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                />
                )}

               {success == null ? (
                 <Button type="submit" isLoading={isLoading}>
                    Get Reset Link
                </Button>
               ) : (
                 <Button type="submit" isLoading={isLoading}>
                   Verify OTP Code
                </Button>
               )}

                {error && <p className="text-red-500 text-center">{error}</p>}
                {success && <p className="text-green-600 text-center">{success}</p>}

                <p className="text-center text-sm">
                    Remember Now?{' '}
                    <Link href="/auth/login" className="text-blue-600 hover:text-blue-500">
                        Sign In
                    </Link>
                </p>
            </form>
        </AuthWrapper>
    );
}