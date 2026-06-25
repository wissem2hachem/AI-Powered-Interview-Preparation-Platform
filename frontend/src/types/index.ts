export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface Resume {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  hasParsedText: boolean;
  uploadedAt: string;
}

export interface ResumeDetail extends Resume {
  parsedText: string | null;
}

export type SessionStatus = 'InProgress' | 'Completed' | 'Abandoned';
export type QuestionCategory = 'Technical' | 'Behavioral' | 'Situational' | 'SystemDesign';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type AnswerType = 'Text' | 'Voice';

export interface Session {
  id: string;
  resumeId: string;
  resumeFileName: string;
  jobRole: string;
  aiModel: string;
  status: SessionStatus;
  totalQuestions: number;
  averageScore: number | null;
  startedAt: string;
  completedAt: string | null;
}

export interface QuestionSummary {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  orderIndex: number;
  hasAnswer: boolean;
}

export interface SessionDetail extends Session {
  questions: QuestionSummary[];
}

export interface Question {
  id: string;
  sessionId: string;
  text: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  orderIndex: number;
  createdAt: string;
}

export interface Feedback {
  id: string;
  score: number;
  strengthPoints: string[];
  weaknessPoints: string[];
  suggestions: string | null;
  idealAnswerHint: string | null;
  aiModel: string;
  generatedAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  text: string | null;
  transcribedText: string | null;
  answerType: AnswerType;
  attemptNumber: number;
  submittedAt: string;
  feedback: Feedback | null;
}

export interface ProgressSnapshot {
  id: string;
  sessionId: string;
  jobRole: string;
  averageScore: number;
  totalQuestions: number;
  answeredQuestions: number;
  categoryScores: Record<string, number> | null;
  date: string;
}

export interface ProgressStats {
  totalSessions: number;
  completedSessions: number;
  totalQuestionsAnswered: number;
  overallAverageScore: number;
  strongestCategory: string | null;
  weakestCategory: string | null;
  averageScoreByRole: Record<string, number>;
  recentSnapshots: ProgressSnapshot[];
}

export const JOB_ROLES = [
  { id: 'backend',  label: 'Backend Engineer',   icon: '⚙️',  color: '#6366f1' },
  { id: 'frontend', label: 'Frontend Engineer',   icon: '🎨',  color: '#8b5cf6' },
  { id: 'fullstack',label: 'Full Stack Engineer', icon: '🔗',  color: '#3b82f6' },
  { id: 'data',     label: 'Data Engineer',       icon: '📊',  color: '#06b6d4' },
  { id: 'ml',       label: 'ML / AI Engineer',    icon: '🤖',  color: '#10b981' },
  { id: 'devops',   label: 'DevOps / Platform',   icon: '🚀',  color: '#f59e0b' },
  { id: 'mobile',   label: 'Mobile Developer',    icon: '📱',  color: '#ec4899' },
  { id: 'security', label: 'Security Engineer',   icon: '🔐',  color: '#ef4444' },
] as const;
