'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.firstName, form.lastName, form.email, form.password);
      toast.success('Account created! Welcome to PrepAI 🚀');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: 24, position: 'relative', zIndex: 1 }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div className="text-center" style={{ marginBottom: 40 }}>
          <Link href="/" className="flex-center gap-1" style={{ marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'var(--grad-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-primary)' }}>
              <span style={{ color: '#040d12', fontWeight: 800, fontSize: 24 }}>◬</span>
            </div>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Create your account</h1>
          <p className="text-secondary" style={{ fontSize: 15 }}>Start practicing for your dream job today</p>
        </div>

        {/* Card */}
        <div className="glass-card-no-hover" style={{ padding: '40px 32px' }}>
          <form onSubmit={handleSubmit} className="flex-col gap-3">
            <div className="grid-cols-2" style={{ gap: 16 }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-firstname" className="input-label">First Name</label>
                <input id="reg-firstname" type="text" className="input" placeholder="John"
                  value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-lastname" className="input-label">Last Name</label>
                <input id="reg-lastname" type="text" className="input" placeholder="Doe"
                  value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: 16 }}>
              <label htmlFor="reg-email" className="input-label">Email Address</label>
              <input id="reg-email" type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>

            <div className="input-group">
              <label htmlFor="reg-password" className="flex-between input-label">
                Password
                <span className="text-muted" style={{ fontWeight: 400, fontSize: 13 }}>(min. 8 chars)</span>
              </label>
              <input id="reg-password" type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={set('password')} required autoComplete="new-password" />
            </div>

            <button id="reg-submit" type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 16, width: '100%' }}>
              {loading
                ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account…</>
                : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-secondary" style={{ marginTop: 32, fontSize: 15 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--mint)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
