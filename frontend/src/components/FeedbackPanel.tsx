import type { Feedback } from '@/types';

export default function FeedbackPanel({ feedback }: { feedback: Feedback }) {
  // Score color logic
  let scoreColor = 'var(--red)';
  let scoreBg = 'rgba(239, 68, 68, 0.1)';
  let scoreGlow = 'rgba(239, 68, 68, 0.3)';
  
  if (feedback.score >= 7) {
    scoreColor = 'var(--mint)';
    scoreBg = 'rgba(52, 211, 153, 0.1)';
    scoreGlow = 'rgba(52, 211, 153, 0.3)';
  } else if (feedback.score >= 5) {
    scoreColor = 'var(--amber)';
    scoreBg = 'rgba(245, 158, 11, 0.1)';
    scoreGlow = 'rgba(245, 158, 11, 0.3)';
  }

  return (
    <div className="glass-card-no-hover animate-fade-in" style={{ padding: 40, borderTop: `4px solid ${scoreColor}` }}>
      <div className="flex-between" style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
        <div>
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>AI Evaluation</h3>
          <p className="badge badge-ghost">Model: {feedback.aiModel}</p>
        </div>
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: scoreBg, border: `2px solid ${scoreColor}`, color: scoreColor,
          boxShadow: `0 0 30px ${scoreGlow}`
        }}>
          <span style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{feedback.score}</span>
          <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>/ 10</span>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gap: 24, marginBottom: 32 }}>
        {/* Strengths */}
        <div style={{ background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <h4 style={{ color: 'var(--mint)', fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>👍</span> Key Strengths
          </h4>
          <ul style={{ paddingLeft: 24, margin: 0, fontSize: 15, color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {feedback.strengthPoints.length > 0 
              ? feedback.strengthPoints.map((s, i) => <li key={i}>{s}</li>)
              : <li style={{ color: 'var(--text-muted)', listStyle: 'none', marginLeft: -24 }}>No specific strengths noted.</li>}
          </ul>
        </div>

        {/* Weaknesses */}
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <h4 style={{ color: 'var(--red)', fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>💡</span> Areas to Improve
          </h4>
          <ul style={{ paddingLeft: 24, margin: 0, fontSize: 15, color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {feedback.weaknessPoints.length > 0
              ? feedback.weaknessPoints.map((w, i) => <li key={i}>{w}</li>)
              : <li style={{ color: 'var(--text-muted)', listStyle: 'none', marginLeft: -24 }}>No major weaknesses noted.</li>}
          </ul>
        </div>
      </div>

      {feedback.suggestions && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Actionable Suggestions</h4>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-primary)' }}>{feedback.suggestions}</p>
        </div>
      )}

      {feedback.idealAnswerHint && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 24, borderLeft: '4px solid var(--cyan)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Ideal Answer Approach</h4>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{feedback.idealAnswerHint}</p>
        </div>
      )}
    </div>
  );
}
