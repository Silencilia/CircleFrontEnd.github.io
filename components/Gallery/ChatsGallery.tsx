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
      if (userId) {
        // User is authenticated - load from Supabase
        const { data, error } = await supabase
          .from('chats')
          .select('id, title, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        if (!isMounted) return;
        if (error) return;
        setChats((data || []) as ChatListRow[]);
      } else {
        // User is offline - load from localStorage
        if (typeof window !== 'undefined') {
          const localChats: ChatListRow[] = [];
          // Scan localStorage for chat message keys
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('circle_chat_messages_')) {
              const chatId = key.replace('circle_chat_messages_', '');
              try {
                const stored = localStorage.getItem(key);
                if (stored) {
                  const messages = JSON.parse(stored);
                  // Prefer stored title if available; else derive from first user message
                  const storedTitle = localStorage.getItem(`circle_chat_title_${chatId}`);
                  let title = storedTitle || '';
                  if (!title) {
                    const firstUserMsg = messages.find((m: any) => m.role === 'user');
                    title = firstUserMsg?.text?.substring(0, 50) || 'Local Chat';
                  }
                  // Get last message timestamp
                  const lastMsg = messages[messages.length - 1];
                  const updated_at = lastMsg?.createdAt || new Date().toISOString();
                  localChats.push({ id: chatId, title, updated_at });
                }
              } catch (e) {
                console.error('Failed to parse local chat', e);
              }
            }
          }
          // Sort by updated_at descending
          localChats.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          if (isMounted) setChats(localChats);
        }
      }
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


