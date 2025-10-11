import { useState, useCallback } from 'react';

export const useInitialInput = () => {
  const [isInitialInput, setIsInitialInput] = useState(true);

  const markAsInputted = useCallback(() => {
    setIsInitialInput(false);
  }, []);

  const resetInitialInput = useCallback(() => {
    setIsInitialInput(true);
  }, []);

  return {
    isInitialInput,
    markAsInputted,
    resetInitialInput,
  };
};

