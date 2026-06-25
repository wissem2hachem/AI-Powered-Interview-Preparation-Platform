'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';

const features = [
  { icon: '📄', title: 'Smart Resume Analysis', desc: 'Upload your PDF resume and our AI extracts your skills to craft hyper-personalized questions.' },
  { icon: '🤖', title: 'AI-Generated Questions', desc: 'Powered by advanced local models — tailored to your exact job role and experience.' },
  { icon: '🎙️', title: 'Voice & Text Answers', desc: 'Answer naturally by typing or speaking — simulating a real high-stakes interview.' },
  { icon: '📊', title: 'Instant AI Feedback', desc: 'Receive a precise 0–10 score with specific strengths, weaknesses, and actionable tips.' },
  { icon: '📈', title: 'Progress Tracking', desc: 'Track your improvement across sessions with visual analytics and category breakdowns.' },
  { icon: '🔒', title: 'Fully Private', desc: 'All AI runs 100% locally on your machine. Your personal data never leaves your computer.' },
];

const roles = ['Backend Engineer', 'Frontend Engineer', 'Data Scientist', 'ML/AI Researcher', 'DevOps', 'Product Manager'];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Navbar />

      {/* ── Hero ───────────────────────────────────────── */}
      <section style={{ padding: '120px 0 80px', textAlign: 'center', position: 'relative' }}>
        
        {/* Glow orb behind hero */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          zIndex: -1, pointerEvents: 'none',
        }} className="animate-pulse-glow" />

        <div className="container animate-float-up">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-full)', padding: '6px 18px',
            fontSize: 13, fontWeight: 700, color: 'var(--mint)',
            marginBottom: 40, letterSpacing: '0.05em', textTransform: 'uppercase'
          }}>
            <span style={{ width: 8, height: 8, background: 'var(--mint)', borderRadius: '50%', boxShadow: '0 0 10px var(--mint)' }} />
            Powered by strictly local AI models
          </div>

          <h1 style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.04em' }}>
            Dominate your next<br />
            <span className="text-gradient">technical interview.</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: 700, margin: '0 auto 48px', lineHeight: 1.6 }}>
            Upload your resume, select your target role, and instantly face AI-generated questions designed to push your limits. Get real-time grading, pinpoint weaknesses, and level up.
          </p>

          <div className="flex-center gap-3" style={{ flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Start Practicing Free
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="#features" className="btn btn-secondary btn-lg">
              Explore Features
            </Link>
          </div>

          {/* Role pills */}
          <div className="flex-center" style={{ marginTop: 64, gap: 12, flexWrap: 'wrap', opacity: 0.7 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginRight: 8 }}>PRACTICE FOR:</span>
            {roles.map(r => (
              <span key={r} style={{
                padding: '6px 16px', borderRadius: 'var(--radius-full)',
                background: 'var(--bg-glass)', border: '1px solid var(--border)',
                fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500
              }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="grid-cols-3" style={{ maxWidth: 900, margin: '0 auto' }}>
            {[
              { value: 'Custom', label: 'Questions tailored to your CV' },
              { value: '0–10', label: 'Rigorous AI scoring scale' },
              { value: '100%', label: 'Private & local execution' },
            ].map((stat, i) => (
              <div key={stat.label} style={{ textAlign: 'center', padding: '0 20px', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }} className="text-gradient">{stat.value}</div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section id="features" style={{ padding: '120px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 20 }}>
              Everything you need to <span className="text-gradient">land the offer</span>
            </h2>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
              A complete, end-to-end interview simulation platform running entirely on your local machine.
            </p>
          </div>

          <div className="grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass-card animate-float-up"
                style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both', padding: 32 }}
              >
                <div style={{ 
                  width: 56, height: 56, borderRadius: 'var(--radius-md)', 
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, marginBottom: 24 
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section style={{ padding: '60px 0 120px' }}>
        <div className="container text-center">
          <div style={{
            background: 'var(--grad-surface)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-xl)',
            padding: '80px 40px',
            position: 'relative',
            overflow: 'hidden'
          }} className="glass-card-no-hover">
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 24 }}>
              Stop guessing. <span className="text-gradient">Start practicing.</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 40, fontSize: 18, maxWidth: 500, margin: '0 auto 40px' }}>
              Join thousands of engineers who have leveled up their interview skills using AI.
            </p>
            <Link href="/register" className="btn btn-primary btn-lg">
              Create Your Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0', textAlign: 'center', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="flex-center gap-1" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={{ fontWeight: 800, fontSize: 18 }} className="text-gradient">PrepAI</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>
            © {new Date().getFullYear()} PrepAI. Running locally. Staying private.
          </p>
        </div>
      </footer>
    </div>
  );
}
