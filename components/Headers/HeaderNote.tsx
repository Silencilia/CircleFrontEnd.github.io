import React from 'react';
import AskCircleButton from '../AskCircleButton';

const HeaderNote: React.FC = () => {
  return (
    <div className="w-full bg-circle-neutral px-4 py-6">
      <div className="max-w-7xl mx-auto relative">
        {/* Circle Title - Always Centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 font-merriweather font-normal text-2xl sm:text-3xl lg:text-4xl text-center text-circle-primary">
          Circle
        </div>
        
        {/* Ask Circle Button - Right Aligned */}
        <div className="flex justify-end">
          <AskCircleButton />
        </div>
      </div>
    </div>
  );
};

export default HeaderNote;
