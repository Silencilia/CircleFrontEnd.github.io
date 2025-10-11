'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChatEntry, ChatMessagePart, ComponentKind } from '../types/chat';

interface ChatContextValue {
  entries: ChatEntry[];
  addUserMessage: (text: string) => Promise<void>;
  addSystemText: (text: string) => Promise<void>;
  addSystemComponent: (kind: ComponentKind, props: unknown) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  chatId: string | null;
  children: React.ReactNode;
}

// ChatProvider supplies chat state and messaging actions to its children via React context.
export const ChatProvider: React.FC<ChatProviderProps> = ({ chatId, children }) => {
  // List of all chat entries (messages and components)
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  // Whether messages should be sent/loaded from Supabase (remote) or only local state
  const [remoteEnabled, setRemoteEnabled] = useState<boolean>(true);
  // Mutable ref of current chatId to use in async handlers
  const chatIdRef = useRef(chatId);
  chatIdRef.current = chatId;

  // On mount: check authentication to determine if remote (Supabase) is available, else fallback to local storage only
  useEffect(() => {
    (async () => {
      const { data: sessionRes } = await supabase.auth.getSession();
      // We are remote-enabled if the session has a user id
      const hasUser = !!sessionRes.session?.user?.id;
      setRemoteEnabled(hasUser);
    })();
  }, []);

  // Upon chatId or remote status changing, load all chat messages from remote, else do nothing
  useEffect(() => {
    let isMounted = true;
    if (!remoteEnabled || !chatId) return;
    (async () => {
      // Query chat_messages in Supabase for this chatId, in creation order
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, text, parts, created_at')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      // If error, skip updating (optional error handling)
      if (error) return;
      if (!isMounted) return;
      // Map every row in returned data to a ChatEntry suitable for our state
      const mapped: ChatEntry[] = (data || []).map((row: any) => ({
        id: row.id,
        role: row.role,
        text: row.text ?? undefined,
        parts: row.parts ?? undefined,
        createdAt: row.created_at,
      }));
      setEntries(mapped);
    })();
    // Unmount: prevent setState if the component is unmounted
    return () => { isMounted = false; };
  }, [chatId, remoteEnabled]);

  // Subscribe to real-time update events for this chat's messages unless in local-only mode
  useEffect(() => {
    if (!remoteEnabled || !chatId) return;
    // Subscribe to all postgres_changes for chat_messages, filtering by this chat's ID
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        // Only handle new inserts — append to local chat state
        if (payload.eventType === 'INSERT') {
          const row: any = payload.new;
          setEntries((prev) => [...prev, {
            id: row.id,
            role: row.role,
            text: row.text ?? undefined,
            parts: row.parts ?? undefined,
            createdAt: row.created_at,
          }]);
        }
      })
      .subscribe();
    // On unmount: remove the real-time channel subscription
    return () => { supabase.removeChannel(channel); };
  }, [chatId, remoteEnabled]);

  // Insert any type of message (user, system, or tool role), directly or optimistically, depending on remote/local mode
  const insertMessage = useCallback(
    async (role: 'user'|'system'|'tool', text?: string, parts?: ChatMessagePart[]) => {
      if (!chatId) return; // Skip if no active chat
      if (remoteEnabled) {
        // Attempt to insert into Supabase, then pick up new message from real-time,
        // or pessimistically add ourselves if for any reason real-time lags
        const { error, data } = await supabase.from('chat_messages').insert({
          chat_id: chatIdRef.current,
          role,
          text: text ?? null,
          parts: parts ?? null,
          status: 'final',
        }).select('id, created_at').single();
        if (error) {
          // Can add an error reporting/tracking here
          console.error('Failed to insert message', error);
        } else {
          // Safeguard/optimistic for cases where real-time doesn't fire
          setEntries((prev) => [...prev, {
            id: data.id,
            role,
            text: text ?? undefined,
            parts: parts ?? undefined,
            createdAt: data.created_at,
          }]);
        }
      } else {
        // Fallback: update local chat only for unauthenticated use
        setEntries((prev) => [...prev, {
          id: crypto.randomUUID(),
          role,
          text: text ?? undefined,
          parts: parts ?? undefined,
          createdAt: new Date().toISOString(),
        }]);
      }
    }, [remoteEnabled, chatId]
  );

  // Insert a user message (as text)
  const addUserMessage = useCallback(
    async (text: string) => {
      await insertMessage('user', text, undefined);
    }, [insertMessage]
  );

  // Insert a system (AI) text message
  const addSystemText = useCallback(
    async (text: string) => {
      await insertMessage('system', text, undefined);
    }, [insertMessage]
  );

  // Insert a system message whose main content is a component (structured/visual)
  const addSystemComponent = useCallback(
    async (kind: ComponentKind, props: unknown) => {
      const parts: ChatMessagePart[] = [{ type: 'component', kind, props }];
      await insertMessage('system', undefined, parts);
    }, [insertMessage]
  );

  // Memoize the context value to avoid unnecessary renders in consumers
  const value = useMemo<ChatContextValue>(() => ({
    entries,
    addUserMessage,
    addSystemText,
    addSystemComponent,
  }), [entries, addUserMessage, addSystemText, addSystemComponent]);

  // Provide children with chat state and message actions for in-line editing, etc.
  return (
    <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
  );
};

// Custom hook to access context. Will throw if used outside a ChatProvider (for bug tracking/isolation).
export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};


