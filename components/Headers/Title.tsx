import React from 'react';
import { AccountButton, NewChatButton } from '../Button';
import { SpeedSwitch } from '../Switch';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSpeedMode } from '../../hooks/useSpeedMode';

interface TitleProps {
  title: string;
  isAccountPage?: boolean;
  isCirclePage?: boolean;
  onNewChat?: () => void;
  hasActiveChat?: boolean;
}

const Title: React.FC<TitleProps> = ({ title, isAccountPage = false, isCirclePage = false, onNewChat, hasActiveChat = false }) => {
  const isMobile = useIsMobile();
  const { isSpeedMode, toggleSpeedMode } = useSpeedMode();

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

        {/* Right actions: NewChatButton (Circle only) and AccountButton */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-fit h-fit flex flex-row items-center px-lg gap-sm">
          {isCirclePage && hasActiveChat && (
            <NewChatButton
              aria-label="Start new chat"
              onClick={() => {
                if (onNewChat) {
                  onNewChat();
                } else {
                  try { localStorage.removeItem('currentChatId'); } catch {}
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('circle:new-chat'));
                  }
                }
              }}
            />
          )}
          <AccountButton active={isAccountPage} disabled={isAccountPage} />
        </div>

        {/* Left actions: SpeedSwitch and label, only if on Circle page */}
        {isCirclePage && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-fit h-fit flex flex-row items-center px-lg gap-sm">
            <SpeedSwitch isSpeedMode={isSpeedMode} onToggle={toggleSpeedMode} />
            <span className="font-circlelabelsmall text-circle-primary">{isSpeedMode ? 'speed mode' : 'talk mode'}</span>
          </div>
        )}
      </div>
    </div>
  ) : (
    // Desktop layout: left SpeedSwitch (if Circle page), center title, right AccountButton
    <div className="flex justify-center">
      <div
        className="title w-full bg-circle-neutral flex items-center justify-center relative"
      >
        {/* Left side: SpeedSwitch and label, only if on Circle page */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-row items-center px-xl gap-md">
          {isCirclePage && (
            <>
              <SpeedSwitch isSpeedMode={isSpeedMode} onToggle={toggleSpeedMode} />
              <span className="font-circlelabelmedium text-circle-primary">{isSpeedMode ? 'speed mode' : 'talk mode'}</span>
            </>
          )}
        </div>

        {/* Center: title text */}
        <div className="font-circledisplaysmall text-center text-circle-primary">
          {title}
        </div>

        {/* Right side: NewChatButton (Circle only) and AccountButton */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-row items-center px-xl gap-sm">
          {isCirclePage && hasActiveChat && (
            <NewChatButton
              aria-label="Start new chat"
              onClick={() => {
                if (onNewChat) {
                  onNewChat();
                } else {
                  try { localStorage.removeItem('currentChatId'); } catch {}
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('circle:new-chat'));
                  }
                }
              }}
            />
          )}
          <AccountButton active={isAccountPage} disabled={isAccountPage} />
        </div>
      </div>
    </div>
  );
};

export default Title;
