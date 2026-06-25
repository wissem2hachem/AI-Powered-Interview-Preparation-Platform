'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(4, 13, 18, 0.7)',
    }}>
      <div className="container flex-between" style={{ height: 72 }}>
        {/* Brand */}
        <Link href={user ? '/dashboard' : '/'} className="flex-center gap-1" style={{ textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--grad-primary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--glow-primary)'
          }}>
            <span style={{ color: '#040d12', fontWeight: 800, fontSize: 18 }}>◬</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }} className="text-primary">
            PrepAI
          </span>
        </Link>

        {/* Links */}
        <div className="flex-center gap-1">
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
              <Link href="/history"   className="btn btn-ghost btn-sm">History</Link>
              
              <div className="flex-center" style={{
                marginLeft: 12, gap: 10,
                padding: '6px 16px 6px 6px',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
              }}>
                <div style={{
                  width: 28, height: 28,
                  background: 'var(--grad-primary)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#040d12'
                }}>
                  {user.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {user.firstName}
                </span>
              </div>

              <button onClick={logout} className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">Log in</Link>
              <Link href="/register" className="btn btn-primary">Start Practicing Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
