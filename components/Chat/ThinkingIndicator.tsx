'use client';

import React, { useState, useEffect } from 'react';

const ThinkingIndicator: React.FC = () => {
  const [dots, setDots] = useState(' . . .');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === ' .') return ' . .';
        if (prev === ' . .') return ' . . .';
        return ' .';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-row h-fit w-full px-md justify-start items-center">
      <span className="font-circlebodymedium text-circle-primary opacity-50">
        Thinking{dots}
      </span>
    </div>
  );
};

export default ThinkingIndicator;
