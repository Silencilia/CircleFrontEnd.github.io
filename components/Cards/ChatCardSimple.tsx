'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { RecycleButton } from '../Button';
import DeleteConfirmationDialog from '../Dialogs/DeleteConfirmationDialog';
import { useRouter } from 'next/navigation';

interface ChatCardSimpleProps {
  chatId: string;
}

interface ChatRow {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

const ChatCardSimple: React.FC<ChatCardSimpleProps> = ({ chatId }) => {
  const [chat, setChat] = useState<ChatRow | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('id, title, created_at, updated_at')
        .eq('id', chatId)
        .single();
      if (!isMounted) return;
      if (error) return;
      setChat(data as ChatRow);
    })();
    return () => { isMounted = false; };
  }, [chatId]);

  const { date, time } = useMemo(() => {
    if (!chat?.updated_at) return { date: 'no date', time: '--:--' };
    try {
      const dt = new Date(chat.updated_at);
      const dateStr = dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const hh = String(dt.getHours()).padStart(2, '0');
      const mm = String(dt.getMinutes()).padStart(2, '0');
      return { date: dateStr, time: `${hh}:${mm}` };
    } catch {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  }, [chat?.updated_at]);

  if (isDeleted) return null;

  return (
    <>
      <div
        className="crd-nt bg-circle-neutral-variant gap-lg shrink-0 cursor-pointer"
        onClick={() => {
          try { localStorage.setItem('currentChatId', chatId); } catch {}
          router.push('/');
        }}
      >
        <div className="w-full h-fit flex flex-col items-start p-0">
          <div className="w-full h-fit flex flex-row justify-between items-start p-0 flex-1">
            <div className="h-fit flex flex-row items-start p-0 flex-1 min-w-0 overflow-hidden">
              <div className="font-circletitlemedium text-circle-primary line-clamp-1 w-full">
                {chat?.title || 'Untitled chat'}
              </div>
            </div>
            <div className="h-fit flex flex-row justify-end items-center gap-lg p-0">
              <div className="w-fit h-fit flex flex-row items-center gap-xs p-0">
                <RecycleButton
                  onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
                  ariaLabel="Delete chat"
                  hoverVariant="neutral"
                />
              </div>
            </div>
          </div>
          <div className="w-fit h-[20px] flex flex-row items-center gap-lg p-0">
            <div className={`w-fit h-[20px] font-circlebodymedium text-circle-primary flex items-center ${date === 'no date' ? 'italic opacity-50' : ''}`}>
              {date}
            </div>
            <div className={`w-fit h-[20px] font-circlebodymedium text-circle-primary flex items-center ${time ? '' : 'italic opacity-50'}`}>
              {time || '--:--'}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={async () => {
          try {
            await supabase.from('chats').delete().eq('id', chatId);
            setIsDeleted(true);
            // Clear currentChatId from localStorage if this was the current chat
            const currentChatId = localStorage.getItem('currentChatId');
            if (currentChatId === chatId) {
              localStorage.removeItem('currentChatId');
            }
          } catch (e) {
            console.error('Failed to delete chat', e);
          } finally {
            setShowDeleteDialog(false);
          }
        }}
        itemType="chat"
        itemName={chat?.title || 'Untitled chat'}
      />
    </>
  );
};

export default ChatCardSimple;


