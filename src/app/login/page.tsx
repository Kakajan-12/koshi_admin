'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Button from '@/Components/ui/Button';
import { Alert, Field, Input } from '@/Components/ui/Form';
import { API_URL } from '@/lib/api';

const Login = () => {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Уже вошли — сразу в админку
    useEffect(() => {
        fetch(`${API_URL}/api/auth/login/me`, { credentials: 'include' })
            .then((res) => res.ok && router.replace('/admin'))
            .catch(() => {});
    }, [router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Сервер ставит httpOnly-cookie с токеном — сам токен странице не виден
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                setError(
                    response.status === 429
                        ? 'Too many attempts. Please wait a few minutes and try again.'
                        : 'Incorrect username or password.'
                );
                setLoading(false);
                return;
            }
            router.push('/admin');
        } catch {
            setError('Could not reach the server. Check your connection and try again.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <div className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-500 text-base font-bold text-white">
                            K
                        </span>
                        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">Sign in to Koşi Admin</h1>
                        <p className="mt-1 text-sm text-slate-500">Manage the menu, orders and website content.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && <Alert>{error}</Alert>}
                        <Field label="Username" htmlFor="username">
                            <Input
                                id="username"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                            />
                        </Field>
                        <Field label="Password" htmlFor="password">
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-slate-400 hover:text-slate-700"
                                >
                                    {showPassword ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
                                </button>
                            </div>
                        </Field>
                        <Button type="submit" loading={loading} className="w-full">
                            Sign in
                        </Button>
                    </form>
                </div>
            </div>

            <div className="relative hidden flex-1 overflow-hidden bg-brand-700 lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700" />
                <div className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10" />
                <div className="absolute -bottom-32 -left-16 size-[28rem] rounded-full bg-white/5" />
                <div className="relative flex h-full flex-col justify-end p-12 text-white">
                    <p className="text-3xl font-semibold leading-tight">Koşi Bakery</p>
                    <p className="mt-2 max-w-sm text-white/80">
                        A place where art meets patisserie and where love pours into desserts.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
