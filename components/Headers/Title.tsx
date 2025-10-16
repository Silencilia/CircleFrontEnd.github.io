import React from 'react';
import { AccountButton } from '../Button';
import { useIsMobile } from '../../hooks/useIsMobile';

interface TitleProps {
  title: string;
  isAccountPage?: boolean;
  hideAccountButton?: boolean;
}

const Title: React.FC<TitleProps> = ({ title, isAccountPage = false, hideAccountButton = false }) => {
  const isMobile = useIsMobile();

  // Render the title bar differently for mobile and desktop
  return isMobile ? (
    // Mobile layout: center title, right AccountButton
    <div className="flex justify-center">
      <div
        className="title w-full bg-circle-neutral flex items-center justify-center relative"
      >
        {/* Centered title text */}
        <div className="font-circledisplayxsmall text-center text-circle-primary">
          {title}
        </div>

        {/* Right actions: AccountButton */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-fit h-fit flex flex-row items-center px-lg gap-sm">
          {!hideAccountButton && (
            <AccountButton active={isAccountPage} disabled={isAccountPage} />
          )}
        </div>
      </div>
    </div>
  ) : (
    // Desktop layout: center title, right AccountButton
    <div className="flex justify-center">
      <div
        className="title w-full bg-circle-neutral flex items-center justify-center relative"
      >
        {/* Center: title text */}
        <div className="font-circledisplaysmall text-center text-circle-primary">
          {title}
        </div>

        {/* Right side: AccountButton */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-row items-center px-xl gap-sm">
          {!hideAccountButton && (
            <AccountButton active={isAccountPage} disabled={isAccountPage} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Title;
