import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { BackToCircleButton } from '../Button';
import { supabase } from '../../lib/supabase';

interface TitleChatsProps {
  title: string;
}

const TitleChats: React.FC<TitleChatsProps> = ({ title }) => {
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

  return isMobile ? (
    <div className="flex justify-center">
      <div
        className="title w-full bg-circle-neutral flex items-center justify-center relative"
      >
        {/* Centered title text */}
        <div className="font-circledisplayxsmall text-center text-circle-primary">
          {title}
        </div>

        {/* Right actions: BackToCircleButton */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-fit h-fit flex flex-row items-center px-lg gap-sm">
          <BackToCircleButton />
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
    <div className="flex justify-center">
      <div
        className="title w-full bg-circle-neutral flex items-center justify-center relative"
      >
        {/* Center: title text */}
        <div className="font-circledisplaysmall text-center text-circle-primary">
          {title}
        </div>

        {/* Right side: BackToCircleButton */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-row items-center px-xl gap-sm">
          <BackToCircleButton />
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

export default TitleChats;


