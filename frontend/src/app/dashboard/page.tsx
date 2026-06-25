'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { resumeApi, sessionApi, progressApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Resume, Session, ProgressStats } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumes, setResumes]   = useState<Resume[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats]       = useState<ProgressStats | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]   = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [rRes, sRes, stRes] = await Promise.all([
        resumeApi.list(),
        sessionApi.list(),
        progressApi.stats(),
      ]);
      setResumes(rRes.data);
      setSessions(sRes.data);
      setStats(stRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setUploading(true);
    try {
      await resumeApi.upload(files[0]);
      toast.success('Resume uploaded successfully!');
      fetchData();
    } catch {
      toast.error('Upload failed. Make sure it\'s a PDF under 10 MB.');
    } finally {
      setUploading(false);
    }
  }, [fetchData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const deleteResume = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Delete this resume?')) return;
    try {
      await resumeApi.delete(id);
      toast.success('Resume deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete resume');
    }
  };

  const recentSessions = sessions.slice(0, 4);

  if (!user) return null;

  return (
    <div className="flex-col" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Navbar />

      <div className="container page-content">
        {/* ── Header ──────────────────────────────────── */}
        <div className="animate-fade-in" style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', marginBottom: 8 }}>
            Welcome back, <span className="text-gradient">{user.firstName}</span> 👋
          </h1>
          <p className="text-secondary" style={{ fontSize: 18 }}>Your AI interview preparation hub.</p>
        </div>

        {/* ── Stats Row ─────────────────────────────── */}
        {stats && (
          <div className="grid-cols-4 animate-float-up" style={{ marginBottom: 56, animationDelay: '0.1s' }}>
            {[
              { label: 'Total Sessions',    value: stats.totalSessions,         icon: '🎯' },
              { label: 'Completed',         value: stats.completedSessions,      icon: '✅' },
              { label: 'Answers Submitted', value: stats.totalQuestionsAnswered, icon: '💬' },
              { label: 'Avg AI Score',      value: stats.overallAverageScore ? `${stats.overallAverageScore}/10` : '—', icon: '📊' },
            ].map((s, i) => (
              <div key={s.label} className="glass-card flex-col gap-1">
                <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }} className="text-gradient">{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid-cols-2" style={{ alignItems: 'start' }}>
          {/* ── Resume Upload ─────────────────────────── */}
          <div className="animate-float-up" style={{ animationDelay: '0.2s' }}>
            <h2 style={{ fontSize: 22, marginBottom: 20 }}>My Resumes</h2>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? 'var(--mint)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragActive ? 'rgba(52, 211, 153, 0.05)' : 'var(--bg-card)',
                transition: 'all var(--transition-bounce)',
                marginBottom: 24,
                boxShadow: isDragActive ? 'var(--glow-primary)' : 'none'
              }}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="flex-col flex-center gap-2">
                  <div className="spinner" />
                  <p className="text-secondary" style={{ fontSize: 14 }}>Analyzing PDF...</p>
                </div>
              ) : (
                <div className="flex-col flex-center">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: isDragActive ? 'var(--mint)' : 'var(--text-primary)' }}>
                    {isDragActive ? 'Drop to upload' : 'Click or drag PDF here'}
                  </p>
                  <p className="text-muted" style={{ fontSize: 13 }}>Maximum size 10 MB</p>
                </div>
              )}
            </div>

            {/* Resume list */}
            <div className="flex-col gap-2">
              {loading && <div className="text-muted text-center" style={{ padding: 20 }}>Loading resumes...</div>}
              {!loading && resumes.length === 0 && (
                <p className="text-muted text-center" style={{ padding: 16 }}>No resumes uploaded yet.</p>
              )}
              {resumes.map(r => (
                <div key={r.id} className="glass-card flex-between" style={{ padding: '16px 20px' }}>
                  <div className="flex-center gap-2">
                    <span style={{ fontSize: 24 }}>📋</span>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{r.fileName}</p>
                      <p className="text-muted" style={{ fontSize: 12 }}>
                        {(r.fileSizeBytes / 1024).toFixed(0)} KB · {new Date(r.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex-center gap-2">
                    {r.hasParsedText && <span className="badge badge-mint">Parsed</span>}
                    <Link href={`/session/new?resumeId=${r.id}`} className="btn btn-primary btn-sm">Practice</Link>
                    <button onClick={(e) => deleteResume(r.id, e)} className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} title="Delete">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Recent Sessions ───────────────────────── */}
          <div className="animate-float-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22 }}>Recent Sessions</h2>
              <Link href="/history" className="text-secondary" style={{ fontSize: 14, fontWeight: 500 }}>View all →</Link>
            </div>

            <div className="flex-col gap-2">
              {!loading && recentSessions.length === 0 && (
                <div className="glass-card flex-col flex-center" style={{ padding: 48 }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>🚀</p>
                  <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ready to practice?</p>
                  <p className="text-secondary text-center" style={{ fontSize: 14 }}>
                    Upload a resume and click Practice to start your first AI interview.
                  </p>
                </div>
              )}
              {recentSessions.map(s => (
                <div key={s.id} className="glass-card flex-between" style={{ padding: '20px' }}>
                  <Link href={s.status === 'InProgress' ? `/session/${s.id}` : `/session/${s.id}/results`}
                    style={{ textDecoration: 'none', flex: 1 }}>
                    <div>
                      <div className="flex-center gap-2" style={{ justifyContent: 'flex-start', marginBottom: 6 }}>
                        <p style={{ fontSize: 16, fontWeight: 700 }}>{s.jobRole}</p>
                        <span className={`badge ${s.status === 'Completed' ? 'badge-teal' : 'badge-amber'}`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-muted" style={{ fontSize: 13 }}>
                        {s.totalQuestions} questions · {new Date(s.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                  <div className="flex-center gap-4">
                    <div style={{ textAlign: 'right' }}>
                      {s.averageScore !== null
                        ? <div style={{ fontSize: 24, fontWeight: 800 }} className="text-gradient">{s.averageScore.toFixed(1)}/10</div>
                        : <div style={{ fontSize: 14, color: 'var(--amber)', fontWeight: 600 }}>In Progress</div>
                      }
                    </div>
                    <button 
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!confirm('Delete this session permanently?')) return;
                        try {
                          await sessionApi.delete(s.id);
                          toast.success('Session deleted');
                          fetchData();
                        } catch {
                          toast.error('Failed to delete session');
                        }
                      }} 
                      className="btn btn-ghost btn-sm" 
                      style={{ color: 'var(--red)' }} 
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
      </div>
    </div>
  );
}
