import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Bell, CheckCheck, Sparkles, Award } from 'lucide-react';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!session) return;
    try {
      const data = await api.get<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Demo notifications
      setNotifications([
        {
          _id: 'n1',
          type: 'answer_accepted',
          title: 'Answer Marked as Accepted!',
          message: 'Your explanation on CS-201 Red-Black Tree rotations was accepted (+15 Reputation Points).',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'n2',
          type: 'mentorship_accepted',
          title: 'Mentorship Confirmed',
          message: 'Aryan Sharma accepted your request for OS Concurrency guidance.',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
      setUnreadCount(2);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s polling fallback for notification sync
    return () => clearInterval(interval);
  }, [session]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/all/read');
    } catch {
      // local fallback
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  if (!session) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className="relative p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface-interactive transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-text-secondary ring-2 ring-surface-base" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-muted border border-border-interactive rounded-lg shadow-md z-50 p-space-3 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-border-default">
            <span className="text-[13px] font-semibold text-text-secondary">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-secondary"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <p className="text-[12px] text-text-tertiary text-center py-4">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-2.5 rounded-md text-[12px] border transition-colors ${
                    n.isRead
                      ? 'bg-surface-base border-border-default text-text-tertiary'
                      : 'bg-surface-interactive border-border-interactive text-text-secondary font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px]">
                    {n.type === 'answer_accepted' ? (
                      <Award className="w-3.5 h-3.5 text-text-secondary" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-text-tertiary" />
                    )}
                    <span className="font-semibold text-text-secondary">{n.title}</span>
                  </div>
                  <p className="text-[12px] text-text-tertiary leading-[16px] font-light">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
