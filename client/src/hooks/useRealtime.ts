import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface PresenceUser {
  userId: string;
  name: string;
  role?: string;
  onlineAt: string;
}

export interface PresenceEventNotice {
  id: string;
  type: 'join' | 'leave';
  name: string;
  timestamp: string;
}

interface RawPresenceState {
  [key: string]: {
    user_id?: string;
    userId?: string;
    name: string;
    role?: string;
    online_at?: string;
    onlineAt?: string;
  }[];
}

export function useRealtimeChannel(
  channelName: string,
  onBroadcast?: (event: string, payload: any) => void
) {
  const { session, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [activePeers, setActivePeers] = useState<PresenceUser[]>([]);
  const [presenceNotices, setPresenceNotices] = useState<PresenceEventNotice[]>([]);
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>('connecting');

  const onBroadcastRef = useRef(onBroadcast);
  useEffect(() => {
    onBroadcastRef.current = onBroadcast;
  }, [onBroadcast]);

  const activeChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!channelName) {
      setConnectionState('disconnected');
      setOnlineUsers([]);
      setActivePeers([]);
      setPresenceNotices([]);
      return;
    }

    setConnectionState('connecting');
    setPresenceNotices([]);

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false }, // Avoid duplicate self-echo as sender renders optimistically
        presence: { key: session?.user?.id || 'anon_' + Math.random().toString(36).slice(2, 7) },
      },
    });

    activeChannelRef.current = channel;

    // Listen for broadcast events from Supabase Realtime
    channel.on('broadcast', { event: '*' }, (payload) => {
      onBroadcastRef.current?.(payload.event, payload.payload);
    });

    // Local custom event listener for local dev/test fallback
    const handleLocalBroadcast = (e: Event) => {
      const customEvent = e as CustomEvent<{ channelName: string; event: string; payload: any }>;
      if (customEvent.detail && customEvent.detail.channelName === channelName) {
        onBroadcastRef.current?.(customEvent.detail.event, customEvent.detail.payload);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('syllabix:realtime', handleLocalBroadcast);
    }

    // Presence tracking: sync, join, and leave
    channel
      .on('presence', { event: 'sync' }, () => {
        const state: RawPresenceState = channel.presenceState();
        const users: PresenceUser[] = [];
        const names: string[] = [];

        Object.values(state).forEach((presences) => {
          presences.forEach((p) => {
            if (p.name) {
              names.push(p.name);
              users.push({
                userId: p.user_id || p.userId || 'guest',
                name: p.name,
                role: p.role || 'student',
                onlineAt: p.online_at || p.onlineAt || new Date().toISOString(),
              });
            }
          });
        });

        setOnlineUsers(names);
        setActivePeers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }: any) => {
        if (Array.isArray(newPresences)) {
          newPresences.forEach((p: any) => {
            if (p.name && p.user_id !== (session?.user?.id || profile?._id)) {
              setPresenceNotices((prev) => [
                ...prev.slice(-4),
                {
                  id: `join-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  type: 'join',
                  name: p.name,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
        if (Array.isArray(leftPresences)) {
          leftPresences.forEach((p: any) => {
            if (p.name && p.user_id !== (session?.user?.id || profile?._id)) {
              setPresenceNotices((prev) => [
                ...prev.slice(-4),
                {
                  id: `leave-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  type: 'leave',
                  name: p.name,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }
          });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionState('connected');
          try {
            await channel.track({
              user_id: profile?._id || session?.user?.id || 'guest',
              name: profile?.name || session?.user?.email?.split('@')[0] || 'Guest Student',
              role: profile?.role || 'student',
              online_at: new Date().toISOString(),
            });
          } catch {
            // Presence tracking error fallback
          }
        } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
          if (!isSupabaseConfigured) {
            setConnectionState('connected');
          } else {
            setConnectionState('disconnected');
          }
        } else if (status === 'CHANNEL_ERROR') {
          if (!isSupabaseConfigured) {
            setConnectionState('connected');
          } else {
            setConnectionState('error');
          }
        }
      });

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('syllabix:realtime', handleLocalBroadcast);
      }
      channel.unsubscribe();
      supabase.removeChannel(channel);
      activeChannelRef.current = null;
    };
  }, [channelName, session?.user?.id, profile?._id, profile?.name, profile?.role]);

  const broadcastEvent = useCallback(
    async (event: string, payload: any) => {
      // 1. Dispatch over active Supabase Realtime channel
      if (activeChannelRef.current) {
        try {
          await activeChannelRef.current.send({
            type: 'broadcast',
            event,
            payload,
          });
        } catch (err) {
          console.warn('[useRealtimeChannel] Supabase broadcast send error:', err);
        }
      }

      // 2. Dispatch local CustomEvent for cross-component / local tab sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('syllabix:realtime', {
            detail: { channelName, event, payload },
          })
        );
      }
    },
    [channelName]
  );

  return { onlineUsers, activePeers, presenceNotices, connectionState, broadcastEvent };
}
