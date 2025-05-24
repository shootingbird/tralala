'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: (isSuccessful?: boolean) => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const { login, signup, isAuthenticated, user } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (isAuthenticated && user) {
                onClose(true);
            }
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, isAuthenticated, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = isLogin 
                ? await login({ email, password })
                : await signup({
                    email,
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phoneNumber
                });

            if (result.success) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    onClose(true);
                }, 2000);
            } else {
                setErrorMessage(result.error || 'Authentication failed');
                setShowErrorModal(true);
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthenticated && user) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={() => onClose(false)}
                type="info"
                title="Authenticating"
                message="Please wait while we prepare your checkout..."
                autoClose
                autoCloseTime={2000}
            />
        );
    }

    return (
        <div className={`fixed inset-0 z-[100] ${isOpen ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black/50 touch-none z-[101]" onClick={() => onClose(false)} />
            <div className="fixed inset-x-0 bottom-0 top-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[480px] bg-white md:rounded-2xl md:max-h-[80vh] h-full md:h-auto overflow-y-auto z-[102]">
                <div className="p-6 md:p-8">
                    <button
                        onClick={() => onClose(false)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-base md:text-lg font-semibold mb-2">{isLogin ? 'Sign In' : 'Create Account'}</h2>
                        <p className="text-sm md:text-base text-gray-600">Continue to checkout</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <Input
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                                <Input
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                                <Input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />
                            </>
                        )}
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            isPassword={true}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                        </button>
                    </div>

                    <div className="mt-4">
                        <Button
                            onClick={() => onClose(true)}
                            variant="secondary"
                            className="w-full"
                        >
                            Continue as guest
                        </Button>
                    </div>
                </div>

                <Modal
                    isOpen={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    type="success"
                    title={isLogin ? "Authentication Successful" : "Account Created!"}
                    message={isLogin
                        ? "Verifying your credentials..."
                        : "Your account has been created successfully. Redirecting to verification..."}
                    autoClose
                    autoCloseTime={2000}
                />

                <Modal
                    isOpen={showErrorModal}
                    onClose={() => setShowErrorModal(false)}
                    type="error"
                    title="Authentication Failed"
                    message={errorMessage}
                />
            </div>
        </div>
    );
};