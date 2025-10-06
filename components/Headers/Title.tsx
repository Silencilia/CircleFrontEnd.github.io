import React from 'react';
import { AccountButton } from '../Button';
import { SpeedSwitch } from '../Switch';
import { useIsMobile } from '../../hooks/useIsMobile';

interface TitleProps {
  title: string;
  isAccountPage?: boolean;
  isCirclePage?: boolean;
}

const Title: React.FC<TitleProps> = ({ title, isAccountPage = false, isCirclePage = false }) => {
  const isMobile = useIsMobile();
  const [isSpeedMode, setIsSpeedMode] = React.useState(false);
  const toggleSpeedMode = React.useCallback(() => setIsSpeedMode(v => !v), []);

  // Render the title bar differently for mobile and desktop
  return isMobile ? (
    // Mobile layout: center title, right AccountButton, left SpeedSwitch (if Circle page)
    <div className="flex justify-center">
      <div
        className="title w-full bg-circle-neutral flex items-center justify-center relative"
      >
        {/* Centered title text */}
        <div className="font-circledisplayxsmall text-center text-circle-primary">
          {title}
        </div>

        {/* Right actions: AccountButton, positioned absolutely with horizontal padding */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-fit h-fit flex flex-row items-center px-lg gap-md">
          <AccountButton active={isAccountPage} disabled={isAccountPage} />
        </div>

        {/* Left actions: SpeedSwitch and label, only if on Circle page */}
        {isCirclePage && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-fit h-fit flex flex-row items-center px-xl gap-md">
            <SpeedSwitch isSpeedMode={isSpeedMode} onToggle={toggleSpeedMode} />
            <span className="font-circlelabelsmall text-circle-primary">{isSpeedMode ? 'speed mode on' : 'speed mode off'}</span>
          </div>
        )}
      </div>
    </div>
  ) : (
    // Desktop layout: left SpeedSwitch (if Circle page), center title, right AccountButton
    <div className="flex justify-center">
      <div
        className="title w-full bg-circle-neutral flex items-center justify-between px-xl"
      >
        {/* Left side: SpeedSwitch and label, only if on Circle page */}
        <div className="flex flex-row items-center gap-md">
          {isCirclePage && (
            <>
              <SpeedSwitch isSpeedMode={isSpeedMode} onToggle={toggleSpeedMode} />
              <span className="font-circlelabelmedium text-circle-primary">{isSpeedMode ? 'speed mode on' : 'speed mode off'}</span>
            </>
          )}
        </div>

        {/* Center: title text, flex-1 to center */}
        <div className="font-circledisplaysmall text-center text-circle-primary flex-1">
          {title}
        </div>

        {/* Right side: AccountButton */}
        <div className="flex flex-row items-center">
          <AccountButton active={isAccountPage} disabled={isAccountPage} />
        </div>
      </div>
    </div>
  );
};

export default Title;
