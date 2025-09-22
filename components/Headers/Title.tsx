import React from 'react';
import { AccountButton } from '../Button';

interface TitleProps {
  title: string;
  isAccountPage?: boolean;
}

const Title: React.FC<TitleProps> = ({ title, isAccountPage = false }) => {
  return (
    <div
      className="title w-full bg-circle-neutral flex items-center justify-center relative"
    >
      <div className="font-circledisplaysmall text-center text-circle-primary">
        {title}
      </div>

      {/* Right actions row with 30px horizontal padding, vertically centered */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-fit h-fit flex flex-row items-center px-xl">
        <AccountButton active={isAccountPage} disabled={isAccountPage} />
      </div>
    </div>
  );
};

export default Title;
