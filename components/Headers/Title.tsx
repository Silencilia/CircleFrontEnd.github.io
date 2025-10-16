import React from 'react';
import { AccountButton } from '../Button';
import { useIsMobile } from '../../hooks/useIsMobile';
import { supabase } from '../../lib/supabase';

interface TitleProps {
  title: string;
  isAccountPage?: boolean;
  hideAccountButton?: boolean;
}

const Title: React.FC<TitleProps> = ({ title, isAccountPage = false, hideAccountButton = false }) => {
  const isMobile = useIsMobile();
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
        {/* Offline indicator (absolute, no layout shift) */}
        {!isAuthenticated && (
          <div className="absolute left-0 right-0 bottom-0 w-full text-center">
            <span className="font-circlemedium text-circle-primary/60 font-circletitlesmall">Offline now. Sign in for stored data.</span>
          </div>
        )}
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

export default Title;
