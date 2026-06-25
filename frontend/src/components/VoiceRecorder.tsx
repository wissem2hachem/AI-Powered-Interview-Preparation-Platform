'use client';

import { useState, useRef } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {!isRecording ? (
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          className="btn"
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-full)',
            padding: '10px 20px',
          }}
        >
          <span style={{ fontSize: 16, color: 'var(--red)' }}>●</span> Record Voice Answer
        </button>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 6px 6px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', animation: 'pulse-glow 1.5s infinite' }} />
            <span style={{ color: 'var(--red)', fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>
              {formatTime(recordingTime)}
            </span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="btn btn-danger btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '6px 16px' }}
          >
            Stop & Submit
          </button>
        </div>
      )}
    </div>
  );
}
