import { useEffect } from 'react';

export function useHashBack(onBack: () => void, hashValue: string = '#card') {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ensureHash = () => {
      try {
        if (window.location.hash !== hashValue) {
          window.location.hash = hashValue;
        }
      } catch (_) {
        // ignore
      }
    };

    const handleHashChange = () => {
      try {
        if (window.location.hash !== hashValue) {
          onBack();
        }
      } catch (_) {
        // ignore
      }
    };

    ensureHash();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [onBack, hashValue]);
}

export default useHashBack;


