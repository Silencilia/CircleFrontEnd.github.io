import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { saveAudioDraft } from '../utils/audioStorage';

export interface RecordingState {
  isSupported: boolean;
  isRecording: boolean;
  isPaused: boolean;
  mimeType: string;
  error: string | null;
  durationSeconds: number; // running duration while recording
}

export interface UseAudioRecorderOptions {
  preferMimeTypes?: string[]; // e.g., ['audio/webm;codecs=opus','audio/mp4']
}

export interface UseAudioRecorderReturn extends RecordingState {
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stopAndSave: () => Promise<{ id: string } | null>;
}

function pickSupportedMimeType(prefer?: string[]): string {
  // SSR guard: on the server, return a safe default
  if (typeof window === 'undefined') {
    return 'audio/webm';
  }
  const candidates = prefer && prefer.length ? prefer : [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4', // Safari fallback for MediaRecorder where available
    'audio/ogg',
  ];
  for (const type of candidates) {
    if ((window as any).MediaRecorder && (window as any).MediaRecorder.isTypeSupported?.(type)) {
      return type;
    }
  }
  return 'audio/webm';
}

export function useAudioRecorder(options?: UseAudioRecorderOptions): UseAudioRecorderReturn {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const pausedAccumRef = useRef<number>(0);
  const pauseStartedRef = useRef<number | null>(null);

  const [state, setState] = useState<RecordingState>(() => ({
    isSupported: typeof window !== 'undefined' && !!(window as any).MediaRecorder,
    isRecording: false,
    isPaused: false,
    mimeType: 'audio/webm',
    error: null,
    durationSeconds: 0,
  }));

  const preferredType = useMemo(() => {
    return pickSupportedMimeType(options?.preferMimeTypes);
  }, [options?.preferMimeTypes]);

  useEffect(() => {
    setState((s) => ({ ...s, mimeType: preferredType }));
  }, [preferredType]);

  // Update running duration every 250ms while recording (excluding paused time)
  useEffect(() => {
    if (!state.isRecording || state.isPaused) return;
    const id = window.setInterval(() => {
      const now = Date.now();
      const start = startTimeRef.current ?? now;
      const pausedAccum = pausedAccumRef.current;
      const pauseStarted = pauseStartedRef.current;
      const effectivePaused = pauseStarted ? pausedAccum + (now - pauseStarted) : pausedAccum;
      const elapsed = Math.max(0, now - start - effectivePaused);
      setState((s) => ({ ...s, durationSeconds: Math.floor(elapsed / 1000) }));
    }, 250);
    return () => window.clearInterval(id);
  }, [state.isRecording, state.isPaused]);

  const start = useCallback(async () => {
    try {
      if (!state.isSupported) throw new Error('Recording not supported');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: preferredType });
      chunksRef.current = [];
      startTimeRef.current = Date.now();
      pausedAccumRef.current = 0;
      pauseStartedRef.current = null;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        // stop all tracks
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(250); // emit data every 250ms
      mediaRecorderRef.current = mr;
      setState((s) => ({ ...s, isRecording: true, isPaused: false, error: null, durationSeconds: 0 }));
    } catch (e: any) {
      setState((s) => ({ ...s, error: e?.message ?? 'Failed to start recording' }));
    }
  }, [preferredType, state.isSupported]);

  const pause = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'recording') return;
    pauseStartedRef.current = Date.now();
    mr.pause();
    setState((s) => ({ ...s, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'paused') return;
    if (pauseStartedRef.current) {
      pausedAccumRef.current += Date.now() - pauseStartedRef.current;
      pauseStartedRef.current = null;
    }
    mr.resume();
    setState((s) => ({ ...s, isPaused: false }));
  }, []);

  const stopAndSave = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return null;
    const stopPromise = new Promise<void>((resolve) => {
      mr.onstop = () => resolve();
    });
    if (mr.state !== 'inactive') mr.stop();
    await stopPromise;

    const duration = state.durationSeconds;
    const blob = new Blob(chunksRef.current, { type: state.mimeType });
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    startTimeRef.current = null;
    pausedAccumRef.current = 0;
    pauseStartedRef.current = null;
    setState((s) => ({ ...s, isRecording: false, isPaused: false }));

    const meta = await saveAudioDraft({ blob, durationSeconds: duration });
    return { id: meta.id };
  }, [state.durationSeconds, state.mimeType]);

  return {
    ...state,
    start,
    pause,
    resume,
    stopAndSave,
  };
}

export default useAudioRecorder;


