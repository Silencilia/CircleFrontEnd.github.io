import { useCallback, useSyncExternalStore } from 'react';

// Singleton store for speed mode
const SPEED_MODE_KEY = 'circle-speed-mode';
let isSpeedModeState = false;
let initialized = false;
const listeners = new Set<() => void>();

function readFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(SPEED_MODE_KEY);
  return stored === 'true';
}

function writeToStorage(value: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SPEED_MODE_KEY, String(value));
}

function initIfNeeded() {
  if (!initialized && typeof window !== 'undefined') {
    initialized = true;
    isSpeedModeState = readFromStorage();
  }
}

function subscribe(callback: () => void) {
  initIfNeeded();
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return isSpeedModeState;
}

function getServerSnapshot() {
  // Default to false on server to avoid hydration mismatch
  return false;
}

function setIsSpeedModeInternal(value: boolean) {
  if (isSpeedModeState === value) return;
  isSpeedModeState = value;
  writeToStorage(value);
  listeners.forEach(l => l());
}

function toggleInternal() {
  setIsSpeedModeInternal(!isSpeedModeState);
}

export const useSpeedMode = () => {
  const isSpeedMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setIsSpeedMode = useCallback((value: boolean) => {
    setIsSpeedModeInternal(value);
  }, []);

  const toggleSpeedMode = useCallback(() => {
    toggleInternal();
  }, []);

  return { isSpeedMode, setIsSpeedMode, toggleSpeedMode };
};

