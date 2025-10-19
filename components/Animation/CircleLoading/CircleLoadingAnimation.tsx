import React, { useState, useEffect } from 'react';
import CircleLoadingIcon from './CircleLoadingIcon';

interface CircleLoadingAnimationProps {
  width?: number;
  height?: number;
  className?: string;
}

const CircleLoadingAnimation: React.FC<CircleLoadingAnimationProps> = ({ 
  width = 30, 
  height = 30, 
  className = "" 
}) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 15) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={className}
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: 'none', // Ensure no transition between frames
        display: 'inline-block'
      }}
    >
      <CircleLoadingIcon 
        width={width} 
        height={height} 
        className="text-circle-primary"
      />
    </div>
  );
};

export default CircleLoadingAnimation;
