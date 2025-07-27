'use client';

import { useState, useEffect } from 'react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { resetPasswordNow } = useAuth();

    useEffect(() => {
        // Get email from URL parameters
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        } else {
            // If no email is provided, redirect back to forgot password
            router.push('/auth/forgot-password');
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        
        if (!email) {
            setError('Email is required');
            return;
        }
        
        setIsLoading(true);
        try {
            const result = await resetPasswordNow(email, password);
            
            if (result.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    router.push('/auth/login');
                }, 2000);
            } else {
                setError(result.error || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Password reset failed:', error);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Alert
                message="Password changed successfully"
                isVisible={showSuccess}
                type='success'
            />
            {error && (
                <Alert
                    message={error}
                    isVisible={!!error}
                    type='danger'
                />
            )}
            <AuthWrapper
                title="Update Password"
                subtitle="Update your account password to continue"
            >
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isPassword
                        required
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        isPassword
                        required
                    />

                    <Button type="submit" isLoading={isLoading}>
                        Update Password
                    </Button>
                </form>
            </AuthWrapper>
        </>
    );
}