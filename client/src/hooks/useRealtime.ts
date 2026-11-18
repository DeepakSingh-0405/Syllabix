import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    if (!channelName) return;

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: session?.user?.id || 'anon_' + Math.random().toString(36).slice(2, 7) },
      },
    });

    // Listen for broadcast events
    if (onBroadcast) {
      channel.on('broadcast', { event: '*' }, (payload) => {
        onBroadcast(payload.event, payload.payload);
      });
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
          await channel.track({
            user_id: session?.user?.id || 'guest',
            name: profile?.name || session?.user?.email?.split('@')[0] || 'Guest Student',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [channelName, session, profile, onBroadcast]);

  const broadcastEvent = async (event: string, payload: any) => {
    const channel = supabase.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event,
      payload,
    });
  };

  return { onlineUsers, broadcastEvent };
}
