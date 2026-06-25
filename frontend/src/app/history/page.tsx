'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { progressApi } from '@/lib/api';
import type { ProgressStats } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistoryPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressApi.stats()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
      </div>
    );
  }

  if (!stats) return <div className="container page-content">Failed to load stats.</div>;

  // Prepare chart data (chronological order)
  const chartData = [...stats.recentSnapshots].reverse().map((s, i) => ({
    name: `S${i + 1}`,
    date: new Date(s.date).toLocaleDateString(),
    score: s.averageScore,
    role: s.jobRole
  }));

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container page-content" style={{ flex: 1 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 32 }}>Your <span className="gradient-text">Progress History</span></h1>

        {stats.totalSessions === 0 ? (
          <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📈</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No history yet</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Complete your first interview session to see your progress charts.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
              {/* Left Column: Charts & Stats */}
              <div>
                <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Average Score Trend</h2>
                  <div style={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 10]} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                          itemStyle={{ color: 'var(--indigo)', fontWeight: 700 }}
                          labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
                          formatter={(val: number) => [`${val.toFixed(1)} / 10`, 'Score']}
                          labelFormatter={(label, payload) => payload[0]?.payload.date || label}
                        />
                        <Line type="monotone" dataKey="score" stroke="var(--indigo)" strokeWidth={3} dot={{ r: 4, fill: 'var(--indigo)' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="glass-card" style={{ padding: 20 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Strongest Category</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{stats.strongestCategory || 'N/A'}</p>
                  </div>
                  <div className="glass-card" style={{ padding: 20 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Needs Improvement</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--amber)' }}>{stats.weakestCategory || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Sessions List */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Session Log</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stats.recentSnapshots.map(s => (
                    <div key={s.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{s.jobRole}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(s.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex-center gap-3">
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--indigo)' }}>
                          {s.averageScore.toFixed(1)}
                        </div>
                        <button 
                          onClick={async () => {
                            if (!confirm('Delete this session permanently?')) return;
                            try {
                              import('@/lib/api').then(({ sessionApi }) => sessionApi.delete(s.sessionId));
                              setStats(prev => prev ? {
                                ...prev,
                                recentSnapshots: prev.recentSnapshots.filter(x => x.id !== s.id),
                                totalSessions: prev.totalSessions - 1
                              } : prev);
                            } catch {
                            }
                          }}
                          className="btn btn-ghost btn-sm" 
                          style={{ color: 'var(--red)', padding: '4px 8px' }} 
                          title="Delete Session"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
