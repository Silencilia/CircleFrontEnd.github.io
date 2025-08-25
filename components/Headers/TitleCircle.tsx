import React from 'react';
import { TitleHeight } from './TitleHeight';

const TitleCircle: React.FC = () => {
  return (
    <div 
      className="w-full bg-circle-neutral flex items-center justify-center"
      style={{ height: TitleHeight }}
    >
      <div className="font-merriweather font-normal text-display-small text-center text-circle-primary">
        Circle
      </div>
    </div>
  );
};

export default TitleCircle;
