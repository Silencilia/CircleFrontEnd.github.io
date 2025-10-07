import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { getAudioDraft } from '../utils/audioStorage';

type PlayerState = {
  currentId: string | null;
  isPlaying: boolean;
};

let playerState: PlayerState = { currentId: null, isPlaying: false };
const listeners = new Set<() => void>();
let audioEl: HTMLAudioElement | null = null;
let currentUrl: string | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): PlayerState {
  return playerState;
}

function getServerSnapshot(): PlayerState {
  return { currentId: null, isPlaying: false };
}

async function playInternal(id: string) {
  if (typeof window === 'undefined') return;
  if (playerState.currentId === id && playerState.isPlaying) return;
  // Stop any existing
  stopInternal();

  const rec = await getAudioDraft(id);
  if (!rec) return;
  const url = URL.createObjectURL(rec.blob);
  currentUrl = url;
  audioEl = new Audio(url);
  audioEl.onended = () => {
    stopInternal();
  };
  await audioEl.play().catch(() => {
    // If autoplay blocked or error, cleanup
    stopInternal();
  });

  playerState = { currentId: id, isPlaying: true };
  emit();
}

function stopInternal() {
  if (typeof window === 'undefined') return;
  
  if (audioEl) {
    try {
      audioEl.pause();
      audioEl.currentTime = 0;
    } catch {}
    audioEl.src = '';
    audioEl = null;
  }
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
  if (playerState.isPlaying || playerState.currentId !== null) {
    playerState = { currentId: null, isPlaying: false };
    emit();
  }
}

export function useAudioPlayer() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const play = useCallback(async (id: string) => {
    await playInternal(id);
  }, []);

  const stop = useCallback(() => {
    stopInternal();
  }, []);

  // Cleanup on unmount of last subscriber is unnecessary for singleton, but stop on visibility hidden
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const onVisibility = () => {
      if (document.hidden) stopInternal();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return { ...state, play, stop };
}

export default useAudioPlayer;


