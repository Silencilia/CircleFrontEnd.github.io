import React from 'react';
import { TitleHeight } from './TitleHeight';
import { AccountButton } from '../Button';

const TitleDraft: React.FC = () => {
  return (
    <div 
      className="w-full bg-circle-neutral flex items-center justify-center relative"
      style={{ height: TitleHeight }}
    >
      <div className="font-merriweather font-normal text-display-small text-center text-circle-primary">
        Draft
      </div>

      {/* Right actions row with 30px horizontal padding, vertically centered */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[114px] h-[54px] flex flex-row items-center px-[30px] gap-[10px]">
        <AccountButton />
      </div>
    </div>
  );
};

export default TitleDraft;

