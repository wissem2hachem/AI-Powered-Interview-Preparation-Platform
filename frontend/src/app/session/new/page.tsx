'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { resumeApi, sessionApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { JOB_ROLES } from '@/types';
import toast from 'react-hot-toast';
import type { Resume } from '@/types';

export default function NewSessionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>(preselectedResumeId || '');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    resumeApi.list().then(res => {
      setResumes(res.data);
      if (!preselectedResumeId && res.data.length > 0) {
        setSelectedResume(res.data[0].id);
      }
    });
  }, [preselectedResumeId]);

  const handleStart = async () => {
    if (!selectedResume || !selectedRole) {
      toast.error('Please select both a resume and a job role');
      return;
    }
    setLoading(true);
    try {
      const roleLabel = JOB_ROLES.find(r => r.id === selectedRole)?.label || selectedRole;
      const res = await sessionApi.create({ resumeId: selectedResume, jobRole: roleLabel });
      router.push(`/session/${res.data.id}`);
    } catch {
      toast.error('Failed to create session');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-col" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Navbar />

      <div className="container page-content" style={{ maxWidth: 800 }}>
        <div className="text-center animate-fade-in" style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', marginBottom: 12 }}>
            Configure Your <span className="text-gradient">Interview</span>
          </h1>
          <p className="text-secondary" style={{ fontSize: 18 }}>
            Select the resume you want the AI to analyze, and the role you are targeting.
          </p>
        </div>

        {/* ── 1. Select Resume ──────────────────────── */}
        <div className="glass-card animate-float-up" style={{ padding: 32, marginBottom: 32, animationDelay: '0.1s' }}>
          <div className="flex-center" style={{ justifyContent: 'flex-start', gap: 12, marginBottom: 24 }}>
            <span style={{ 
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
              width: 28, height: 28, borderRadius: '50%', background: 'var(--grad-primary)', 
              color: '#040d12', fontSize: 14, fontWeight: 800 
            }}>1</span>
            <h2 style={{ fontSize: 20 }}>Select Resume</h2>
          </div>
          
          <div className="flex-col gap-2">
            {resumes.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 24, border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                No resumes available. Please upload one on the Dashboard first.
              </div>
            ) : (
              resumes.map(r => (
                <label key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px',
                  border: `2px solid ${selectedResume === r.id ? 'var(--mint)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: selectedResume === r.id ? 'rgba(52, 211, 153, 0.05)' : 'var(--bg-glass)',
                  boxShadow: selectedResume === r.id ? 'var(--glow-primary)' : 'none',
                  transition: 'all var(--transition-mid)',
                }}>
                  <input type="radio" name="resume" value={r.id} checked={selectedResume === r.id}
                    onChange={() => setSelectedResume(r.id)} style={{ width: 18, height: 18, accentColor: 'var(--mint)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: selectedResume === r.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{r.fileName}</div>
                    <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>Uploaded {new Date(r.uploadedAt).toLocaleDateString()}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* ── 2. Select Role ────────────────────────── */}
        <div className="glass-card animate-float-up" style={{ padding: 32, marginBottom: 48, animationDelay: '0.2s' }}>
          <div className="flex-center" style={{ justifyContent: 'flex-start', gap: 12, marginBottom: 24 }}>
            <span style={{ 
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
              width: 28, height: 28, borderRadius: '50%', background: 'var(--grad-primary)', 
              color: '#040d12', fontSize: 14, fontWeight: 800 
            }}>2</span>
            <h2 style={{ fontSize: 20 }}>Select Target Role</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {JOB_ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '16px',
                  border: `2px solid ${selectedRole === role.id ? 'var(--mint)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: selectedRole === role.id ? 'rgba(52, 211, 153, 0.08)' : 'var(--bg-glass)',
                  boxShadow: selectedRole === role.id ? 'var(--glow-primary)' : 'none',
                  color: 'var(--text-primary)', textAlign: 'left',
                  transition: 'all var(--transition-bounce)',
                  transform: selectedRole === role.id ? 'translateY(-2px)' : 'none',
                }}
              >
                <span style={{ fontSize: 24 }}>{role.icon}</span>
                <span style={{ fontSize: 15, fontWeight: selectedRole === role.id ? 700 : 500 }}>{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Actions ─────────────────────────────── */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={handleStart}
            disabled={!selectedResume || !selectedRole || loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', maxWidth: 360, fontSize: 18 }}
          >
            {loading ? <><span className="spinner" /> Generating Questions...</> : 'Start Interview 🚀'}
          </button>
          <p className="text-muted" style={{ marginTop: 20, fontSize: 14 }}>
            This will take a few seconds as the AI reads your resume and generates tailored questions.
          </p>
        </div>
      </div>
    </div>
  );
}
