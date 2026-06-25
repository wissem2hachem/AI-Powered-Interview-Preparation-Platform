'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: 24, position: 'relative', zIndex: 1 }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div className="text-center" style={{ marginBottom: 40 }}>
          <Link href="/" className="flex-center gap-1" style={{ marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'var(--grad-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-primary)' }}>
              <span style={{ color: '#040d12', fontWeight: 800, fontSize: 24 }}>◬</span>
            </div>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Welcome back</h1>
          <p className="text-secondary" style={{ fontSize: 15 }}>Sign in to continue your interview prep</p>
        </div>

        {/* Card */}
        <div className="glass-card-no-hover" style={{ padding: '40px 32px' }}>
          <form onSubmit={handleSubmit} className="flex-col gap-3">
            <div className="input-group">
              <label htmlFor="login-email" className="input-label">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="login-password" className="input-label">Password</label>
              <input
                id="login-password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button id="login-submit" type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 12, width: '100%' }}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Authenticating...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-secondary" style={{ marginTop: 32, fontSize: 15 }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--mint)', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
