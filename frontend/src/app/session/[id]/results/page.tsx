'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { sessionApi } from '@/lib/api';
import type { SessionDetail } from '@/types';

export default function SessionResultsPage() {
  const { id } = useParams();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionApi.getById(id as string)
      .then(res => setSession(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <p className="text-secondary" style={{ marginTop: 16 }}>Loading results...</p>
      </div>
    );
  }

  if (!session) return <div className="container page-content text-center text-red">Session not found.</div>;

  const score = session.averageScore || 0;
  let scoreColor = 'var(--red)';
  let scoreGlow = 'var(--glow-subtle)';
  if (score >= 7) { scoreColor = 'var(--mint)'; scoreGlow = 'var(--glow-strong)'; }
  else if (score >= 5) { scoreColor = 'var(--amber)'; scoreGlow = '0 0 30px rgba(245,158,11,0.3)'; }

  return (
    <div className="flex-col" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Navbar />

      <div className="container page-content" style={{ flex: 1, maxWidth: 860 }}>
        {/* Header */}
        <div className="text-center animate-float-up" style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
            Interview <span className="text-gradient">Completed</span>
          </h1>
          <p className="text-secondary" style={{ fontSize: 18 }}>
            Role: <strong style={{ color: 'var(--text-primary)' }}>{session.jobRole}</strong>
          </p>
        </div>

        {/* Score Card */}
        <div className="glass-card-no-hover animate-float-up text-center" style={{ padding: 48, marginBottom: 48, animationDelay: '0.1s' }}>
          <h2 style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Overall AI Evaluation</h2>
          <div className="flex-center" style={{ margin: '0 auto' }}>
            <div className="flex-center flex-col" style={{
              width: 160, height: 160, borderRadius: '50%',
              background: `rgba(${score >= 7 ? '52, 211, 153' : score >= 5 ? '245, 158, 11' : '239, 68, 68'}, 0.05)`,
              border: `4px solid ${scoreColor}`,
              color: scoreColor, boxShadow: scoreGlow
            }}>
              <span style={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{score.toFixed(1)}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>/ 10</span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <h3 className="animate-fade-in" style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, animationDelay: '0.2s' }}>Question Breakdown</h3>
        <div className="flex-col gap-2 animate-float-up" style={{ animationDelay: '0.3s' }}>
          {session.questions.map((q, i) => (
            <div key={q.id} className="glass-card flex-between" style={{ padding: '24px', alignItems: 'flex-start' }}>
              <div className="flex-center" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border)', fontSize: 15, fontWeight: 800, flexShrink: 0, marginTop: -2 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, marginLeft: 20 }}>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, lineHeight: 1.5, color: 'var(--text-primary)' }}>{q.text}</p>
                <div className="flex-center gap-1" style={{ justifyContent: 'flex-start' }}>
                  <span className="badge badge-mint">{q.category}</span>
                  <span className="badge badge-ghost">{q.difficulty}</span>
                </div>
              </div>
              <div style={{ marginLeft: 20 }}>
                {q.hasAnswer ? <span className="badge badge-teal">Answered</span> : <span className="badge badge-red">Skipped</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex-center animate-fade-in" style={{ marginTop: 56, gap: 20, animationDelay: '0.4s' }}>
          <Link href="/dashboard" className="btn btn-secondary btn-lg">Back to Dashboard</Link>
          <Link href="/history" className="btn btn-primary btn-lg">View Full History</Link>
        </div>
      </div>
    </div>
  );
}
