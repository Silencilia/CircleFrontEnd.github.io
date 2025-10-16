import React from 'react';
import { AccountButton, NewChatButton, ChatsButton } from '../Button';
import { SpeedSwitch } from '../Switch';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSpeedMode } from '../../hooks/useSpeedMode';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

interface TitleCircleProps {
  title: string;
  isAccountPage?: boolean;
  onNewChat?: () => void;
  hasActiveChat?: boolean;
  hideAccountButton?: boolean;
}

const TitleCircle: React.FC<TitleCircleProps> = ({ title, isAccountPage = false, onNewChat, hasActiveChat = false, hideAccountButton = false }) => {
  const isMobile = useIsMobile();
  const { isSpeedMode, toggleSpeedMode } = useSpeedMode();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(true);

  React.useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      setIsAuthenticated(!!userRes.user?.id);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user?.id);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  // Render the title bar differently for mobile and desktop
  return isMobile ? (
    // Mobile layout: center title, right AccountButton and NewChatButton, left SpeedSwitch
    <div className="flex justify-center">
      <div
        className="title w-full bg-circle-neutral flex items-center justify-center relative"
      >
     

        {/* Right actions: NewChatButton and AccountButton */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-fit h-fit flex flex-row items-center px-lg gap-sm">
          {hasActiveChat && (
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
          {!hideAccountButton && (
            <AccountButton active={isAccountPage} disabled={isAccountPage} />
          )}
        </div>

        {/* Left actions: Chats button, SpeedSwitch and label */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-fit h-fit flex flex-row items-start px-lg gap-sm">
          <ChatsButton onClick={() => router.push('/chats')} />
          <div className="flex flex-row items-center gap-sm">
          <SpeedSwitch isSpeedMode={isSpeedMode} onToggle={toggleSpeedMode} />
          <span className="font-circlelabelsmall text-circle-primary">{isSpeedMode ? 'speed mode' : 'talk mode'}</span>
          </div>
        </div>
        {/* Offline indicator (absolute, no layout shift) */}
        {!isAuthenticated && (
          <div className="absolute left-0 right-0 bottom-0 w-full text-center">
            <span className="font-circlemedium text-circle-primary/60 font-circletitlesmall">Offline now. Sign in for stored data.</span>
          </div>
        )}
      </div>
    </div>
  ) : (
    // Desktop layout: left SpeedSwitch, center title, right AccountButton and NewChatButton
    <div className="flex justify-center">
      <div
        className="title w-full bg-circle-neutral flex items-center justify-center relative"
      >
        {/* Left side: Chats button, SpeedSwitch and label */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-row items-center px-xl gap-md">
          <ChatsButton onClick={() => router.push('/chats')} />
          <SpeedSwitch isSpeedMode={isSpeedMode} onToggle={toggleSpeedMode} />
          <span className="font-circlelabelmedium text-circle-primary">{isSpeedMode ? 'speed mode' : 'talk mode'}</span>
        </div>

        {/* Center: title text */}
        <div className="font-circledisplaysmall text-center text-circle-primary">
          {title}
        </div>

        {/* Right side: NewChatButton and AccountButton */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-row items-center px-xl gap-sm">
          {hasActiveChat && (
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
          {!hideAccountButton && (
            <AccountButton active={isAccountPage} disabled={isAccountPage} />
          )}
        </div>
        {/* Offline indicator (absolute, no layout shift) */}
        {!isAuthenticated && (
          <div className="absolute left-0 right-0 bottom-0 w-full text-center">
            <span className="font-circlemedium text-circle-primary/60 font-circletitlesmall">Offline now. Sign in for stored data.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleCircle;


