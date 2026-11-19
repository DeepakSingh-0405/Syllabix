import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

interface PresenceState {
  [key: string]: {
    user_id: string;
    name: string;
    online_at: string;
  }[];
}

export function useRealtimeChannel(
  channelName: string,
  onBroadcast?: (event: string, payload: any) => void
) {
  const { session, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>('connecting');

  const onBroadcastRef = useRef(onBroadcast);
  useEffect(() => {
    onBroadcastRef.current = onBroadcast;
  }, [onBroadcast]);

  const activeChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!channelName) {
      setConnectionState('disconnected');
      return;
    }

    setConnectionState('connecting');

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

    // Presence tracking
    channel
      .on('presence', { event: 'sync' }, () => {
        const state: PresenceState = channel.presenceState();
        const names: string[] = [];
        Object.values(state).forEach((presences) => {
          presences.forEach((p) => {
            if (p.name) names.push(p.name);
          });
        });
        setOnlineUsers(names);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionState('connected');
          try {
            await channel.track({
              user_id: session?.user?.id || 'guest',
              name: profile?.name || session?.user?.email?.split('@')[0] || 'Guest Student',
              online_at: new Date().toISOString(),
            });
          } catch {
            // Presence tracking error fallback
          }
        } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
          // If remote Supabase is unconfigured, fallback gracefully to connected local channel
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
  }, [channelName, session?.user?.id, profile?.name]);

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

  return { onlineUsers, connectionState, broadcastEvent };
}
