import React, { useEffect, useMemo, useState } from 'react';
import ChatCardSimple from '../Cards/ChatCardSimple';
import { supabase } from '../../lib/supabase';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ChatListRow {
  id: string;
  title: string | null;
  updated_at: string;
}

interface ChatsGalleryProps {
  query?: string;
}

const ChatsGallery: React.FC<ChatsGalleryProps> = ({ query = '' }) => {
  const [chats, setChats] = useState<ChatListRow[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data: sessionRes } = await supabase.auth.getSession();
      const userId = sessionRes.session?.user?.id;
      if (!userId) {
        if (isMounted) setChats([]);
        return;
      }
      const { data, error } = await supabase
        .from('chats')
        .select('id, title, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (!isMounted) return;
      if (error) return;
      setChats((data || []) as ChatListRow[]);
    })();
    return () => { isMounted = false; };
  }, []);

  const items = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return chats;
    return chats.filter(c => (c.title || 'untitled chat').toLowerCase().includes(q));
  }, [chats, query]);

  return (
    <div className={`w-full px-lg pb-md flex flex-row items-start`}>
      <div className={`w-full flex flex-col justify-start items-center ${isMobile ? 'gap-lg' : 'gap-xl'}`}>
        {items.length > 0 ? (
          items.map((c) => (
            <ChatCardSimple key={c.id} chatId={c.id} />
          ))
        ) : (
          <div className={`text-center text-circle-primary/60 ${isMobile ? 'font-circlebodysmall' : 'font-circlebodymedium'} w-full`}>
            No chats yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsGallery;


