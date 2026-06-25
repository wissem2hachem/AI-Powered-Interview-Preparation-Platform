'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { questionApi, answerApi, sessionApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import VoiceRecorder from '@/components/VoiceRecorder';
import FeedbackPanel from '@/components/FeedbackPanel';
import type { Question, Answer, Feedback } from '@/types';
import toast from 'react-hot-toast';

export default function ActiveSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [textAnswer, setTextAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  // New state for Skip / Ideal Answer features
  const [fetchingIdealAnswer, setFetchingIdealAnswer] = useState(false);
  const [idealAnswerText, setIdealAnswerText] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        let qRes = await questionApi.list(id as string);
        
        if (qRes.data.length === 0) {
          toast.loading('AI is reading your resume & generating questions...', { id: 'genQ' });
          await questionApi.generate(id as string);
          qRes = await questionApi.list(id as string);
          toast.success('Questions generated!', { id: 'genQ' });
        }
        
        setQuestions(qRes.data);
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        console.error('❌ Error generating questions:', msg);
        toast.error('Failed to load session questions');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const currentQ = questions[currentIndex];

  const handleTextSubmit = async () => {
    if (!textAnswer.trim()) return;
    setSubmitting(true);
    try {
      const res = await answerApi.submitText({ questionId: currentQ.id, text: textAnswer });
      setCurrentAnswer(res.data);
      generateFeedback(res.data.id);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      console.error('❌ Error submitting text answer:', msg);
      toast.error('Failed to submit answer');
      setSubmitting(false);
    }
  };

  const handleVoiceSubmit = async (blob: Blob) => {
    setSubmitting(true);
    try {
      const res = await answerApi.submitVoice(currentQ.id, blob);
      setCurrentAnswer(res.data);
      generateFeedback(res.data.id);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      console.error('❌ Error submitting voice answer:', msg);
      toast.error('Failed to submit voice answer');
      setSubmitting(false);
    }
  };

  const generateFeedback = async (answerId: string) => {
    setGeneratingFeedback(true);
    try {
      const res = await answerApi.generateFeedback(answerId);
      setCurrentAnswer(prev => prev ? { ...prev, feedback: res.data } : null);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      console.error('❌ Error generating feedback:', msg);
      toast.error('Failed to generate AI feedback');
    } finally {
      setSubmitting(false);
      setGeneratingFeedback(false);
    }
  };

  const handleSkip = () => {
    setSkipped(true);
  };

  const handleShowIdealAnswer = async () => {
    setFetchingIdealAnswer(true);
    try {
      const res = await questionApi.getIdealAnswer(currentQ.id);
      setIdealAnswerText(res.data.text);
      setSkipped(true);
    } catch (err) {
      toast.error('Failed to get ideal answer');
    } finally {
      setFetchingIdealAnswer(false);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTextAnswer('');
      setCurrentAnswer(null);
      setSkipped(false);
      setIdealAnswerText(null);
    } else {
      toast.loading('Saving session results...', { id: 'complete' });
      try {
        await sessionApi.complete(id as string);
        toast.success('Session completed!', { id: 'complete' });
        router.push(`/session/${id}/results`);
      } catch {
        toast.error('Failed to complete session', { id: 'complete' });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
        <p className="text-secondary animate-pulse">Initializing interview environment...</p>
      </div>
    );
  }

  if (!questions.length) return <div className="text-center" style={{ padding: 40 }}>No questions found.</div>;

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="flex-col" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Navbar />

      <div className="container page-content" style={{ flex: 1, maxWidth: 860 }}>
        {/* Progress bar */}
        <div className="animate-fade-in" style={{ marginBottom: 40 }}>
          <div className="flex-between text-secondary" style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentIndex) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((currentIndex) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-card-no-hover animate-float-up" key={currentQ.id} style={{ padding: '40px', marginBottom: 32, borderLeft: '4px solid var(--mint)' }}>
          <div className="flex-center" style={{ justifyContent: 'flex-start', gap: 12, marginBottom: 24 }}>
            <span className="badge badge-mint">{currentQ.category}</span>
            <span className="badge badge-ghost">{currentQ.difficulty}</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-primary)' }}>
            {currentQ.text}
          </h2>
        </div>

        {/* Answer Area */}
        {!currentAnswer && !skipped ? (
          <div className="glass-card-no-hover animate-float-up" style={{ padding: 32, animationDelay: '0.1s' }}>
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>Your Answer</h3>
              <div className="flex-center gap-1">
                <button onClick={handleSkip} disabled={submitting || fetchingIdealAnswer} className="btn btn-ghost btn-sm">Skip Question</button>
                <button onClick={handleShowIdealAnswer} disabled={submitting || fetchingIdealAnswer} className="btn btn-secondary btn-sm">
                  {fetchingIdealAnswer ? <><span className="spinner" style={{width: 14, height: 14, borderWidth: 2}}/> Generating...</> : 'Show Ideal Answer'}
                </button>
              </div>
            </div>
            
            <textarea
              className="input"
              style={{ minHeight: 200, marginBottom: 24, fontSize: 16 }}
              placeholder="Type your answer here..."
              value={textAnswer}
              onChange={e => setTextAnswer(e.target.value)}
              disabled={submitting || fetchingIdealAnswer}
            />

            <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
              <VoiceRecorder onRecordingComplete={handleVoiceSubmit} disabled={submitting || fetchingIdealAnswer || textAnswer.trim().length > 0} />
              
              <button
                onClick={handleTextSubmit}
                disabled={!textAnswer.trim() || submitting || fetchingIdealAnswer}
                className="btn btn-primary btn-lg"
                style={{ padding: '14px 32px' }}
              >
                {submitting && !generatingFeedback ? <><span className="spinner" style={{width: 16, height: 16, borderWidth: 2}}/> Submitting...</> : 'Submit Answer'}
              </button>
            </div>
          </div>
        ) : skipped ? (
          <div className="animate-float-up" style={{ animationDelay: '0.1s' }}>
            <div className="glass-card-no-hover" style={{ padding: 32, borderLeft: '4px solid var(--amber)' }}>
              <div className="flex-center gap-1" style={{ justifyContent: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>⏭️</span>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--amber)' }}>Question Skipped</h3>
              </div>
              <p className="text-secondary" style={{ fontSize: 15, marginBottom: 24 }}>This question will not be included in your final score.</p>
              
              {idealAnswerText && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 24, borderLeft: '4px solid var(--cyan)' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>AI Ideal Answer</h4>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{idealAnswerText}</p>
                </div>
              )}
            </div>
            
            <div className="animate-fade-in" style={{ marginTop: 32, textAlign: 'right' }}>
              <button onClick={handleNext} className="btn btn-primary btn-lg" style={{ padding: '16px 40px', fontSize: 18 }}>
                {isLastQuestion ? 'Finish Session 🏆' : 'Next Question →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-float-up" style={{ animationDelay: '0.1s' }}>
            {generatingFeedback ? (
              <div className="glass-card-no-hover flex-col flex-center animate-pulse-glow" style={{ padding: 60, border: '1px solid var(--border-accent)' }}>
                <div className="spinner" style={{ marginBottom: 24, width: 40, height: 40, borderWidth: 3 }} />
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }} className="text-gradient">AI is analyzing your answer</h3>
                <p className="text-secondary" style={{ fontSize: 15 }}>Evaluating your response against industry standards...</p>
              </div>
            ) : currentAnswer?.feedback ? (
              <FeedbackPanel feedback={currentAnswer.feedback} />
            ) : (
              <div className="glass-card-no-hover" style={{ padding: 24, color: 'var(--red)' }}>Failed to load feedback.</div>
            )}

            {/* Next Button */}
            {currentAnswer?.feedback && (
              <div className="animate-fade-in" style={{ marginTop: 32, textAlign: 'right', animationDelay: '0.3s' }}>
                <button onClick={handleNext} className="btn btn-primary btn-lg" style={{ padding: '16px 40px', fontSize: 18 }}>
                  {isLastQuestion ? 'Finish Session 🏆' : 'Next Question →'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
