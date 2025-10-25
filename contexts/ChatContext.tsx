'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChatEntry, ChatMessagePart, ComponentKind } from '../types/chat';

interface ChatContextValue {
  entries: ChatEntry[];
  addUserMessage: (text: string) => Promise<string>;
  addSystemText: (text: string) => Promise<void>;
  addSystemComponent: (kind: ComponentKind, props: unknown) => Promise<void>;
  chatId: string | null;
  isThinking: boolean;
  setIsThinking: (thinking: boolean) => void;
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
  // Whether an API request is in progress and we're waiting for a system response
  const [isThinking, setIsThinking] = useState<boolean>(false);
  // Mutable ref of current chatId to use in async handlers
  const chatIdRef = useRef(chatId);
  chatIdRef.current = chatId;

  // Combined initialization effect - handles auth check, chat loading, and real-time setup
  useEffect(() => {
    let isMounted = true;
    
    const initializeChat = async () => {
      // Check authentication
      const { data: sessionRes } = await supabase.auth.getSession();
      const hasUser = !!sessionRes.session?.user?.id;
      setRemoteEnabled(hasUser);
      
      // Restore isThinking state from localStorage
      if (chatId && typeof window !== 'undefined') {
        const thinkingKey = `circle_isThinking_${chatId}`;
        const savedThinking = localStorage.getItem(thinkingKey);
        if (savedThinking) {
          try {
            setIsThinking(JSON.parse(savedThinking));
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      
      if (!chatId || !isMounted) return;
      
      // Load chat messages
      if (hasUser) {
        // Load from Supabase
        const { data, error } = await supabase
          .from('chat_messages')
          .select('id, role, text, parts, created_at')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
        
        if (!error && isMounted) {
          const mapped: ChatEntry[] = (data || []).map((row: any) => ({
            id: row.id,
            role: row.role,
            text: row.text ?? undefined,
            parts: row.parts ?? undefined,
            createdAt: row.created_at,
          }));
          setEntries(mapped);
        }
      } else {
        // Load from localStorage
        if (typeof window !== 'undefined') {
          const key = `circle_chat_messages_${chatId}`;
          const stored = localStorage.getItem(key);
          if (stored && isMounted) {
            try {
              const parsed = JSON.parse(stored);
              setEntries(parsed);
            } catch (e) {
              console.error('Failed to parse chat messages from localStorage', e);
              setEntries([]);
            }
          } else if (isMounted) {
            setEntries([]);
          }
        }
      }
      
      // Setup real-time subscription for authenticated users
      if (hasUser && chatId && isMounted) {
        const channel = supabase
          .channel(`chat:${chatId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
            filter: `chat_id=eq.${chatId}`,
          }, (payload) => {
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
        
        return () => {
          supabase.removeChannel(channel);
        };
      }
    };
    
    initializeChat();
    
    return () => {
      isMounted = false;
    };
  }, [chatId]);

  // Insert any type of message (user, system, or tool role), directly or optimistically, depending on remote/local mode
  const insertMessage = useCallback(
    async (role: 'user'|'system'|'tool', text?: string, parts?: ChatMessagePart[]): Promise<string> => {
      if (!chatIdRef.current) throw new Error('No active chat');
      if (remoteEnabled) {
        const { error, data } = await supabase.from('chat_messages').insert({
          chat_id: chatIdRef.current,
          role,
          text: text ?? null,
          parts: parts ?? null,
          status: 'final',
        }).select('id, created_at').single();
        if (error) {
          console.error('Failed to insert message', error);
          throw error;
        }
        // Do not optimistically append; rely on realtime to maintain unidirectional flow
        return data.id as string;
      } else {
        // Local-only fallback (unauthenticated)
        const localId = crypto.randomUUID();
        const newEntry: ChatEntry = {
          id: localId,
          role,
          text: text ?? undefined,
          parts: parts ?? undefined,
          createdAt: new Date().toISOString(),
        };
        setEntries((prev) => {
          const updated = [...prev, newEntry];
          // Persist to localStorage
          if (typeof window !== 'undefined' && chatIdRef.current) {
            const key = `circle_chat_messages_${chatIdRef.current}`;
            localStorage.setItem(key, JSON.stringify(updated));
          }
          return updated;
        });
        return localId;
      }
    }, [remoteEnabled]
  );

  // Insert a user message (as text)
  const addUserMessage = useCallback(
    async (text: string) => {
      const id = await insertMessage('user', text, undefined);
      return id;
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

  // Persist isThinking to localStorage whenever it changes
  useEffect(() => {
    if (chatId && typeof window !== 'undefined') {
      const thinkingKey = `circle_isThinking_${chatId}`;
      localStorage.setItem(thinkingKey, JSON.stringify(isThinking));
    }
  }, [isThinking, chatId]);

  // Clear isThinking when switching chats
  useEffect(() => {
    setIsThinking(false);
    // Also clear localStorage value for previous chat
    if (chatId && typeof window !== 'undefined') {
      const thinkingKey = `circle_isThinking_${chatId}`;
      localStorage.removeItem(thinkingKey);
    }
  }, [chatId]);

  // Memoize the context value to avoid unnecessary renders in consumers
  const value = useMemo<ChatContextValue>(() => ({
    entries,
    addUserMessage,
    addSystemText,
    addSystemComponent,
    chatId: chatIdRef.current ?? null,
    isThinking,
    setIsThinking,
  }), [entries, addUserMessage, addSystemText, addSystemComponent, chatIdRef.current, isThinking, setIsThinking]);

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

