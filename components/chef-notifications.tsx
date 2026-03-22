'use client';

import { useEffect, useState } from 'react';
import { Bell, X, Printer, Check } from 'lucide-react';
import { printKOT } from '@/lib/print-utils';

interface KOTData {
  _id: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: number;
  items: Array<{ name: string; quantity: number }>;
  specialInstructions?: string;
  status: 'pending' | 'received' | 'preparing' | 'ready' | 'served';
  createdAt: string;
  printCount: number;
  printedAt?: string;
}

interface NotificationData extends KOTData {
  read: boolean;
}

export function ChefNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // Poll for new KOTs every 5 seconds
  useEffect(() => {
    const fetchNewKOTs = async () => {
      try {
        const response = await fetch('/api/kitchen/kots?status=pending', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const kots = data.kots || [];

        if (kots.length > 0) {
          const newNotifications = kots.map((kot: KOTData) => ({
            ...kot,
            read: false,
          }));

          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n._id));
            const filtered = newNotifications.filter(
              (n: NotificationData) => !existingIds.has(n._id)
            );
            return [...filtered, ...prev].filter((_, i) => i < 20); // Keep last 20
          });
        }
      } catch (error) {
        console.error('Failed to fetch KOTs:', error);
      }
    };

    const interval = setInterval(fetchNewKOTs, 5000); // Poll every 5 seconds
    fetchNewKOTs(); // Initial fetch

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const printKOTTicket = async (kot: KOTData) => {
    try {
      printKOT({
        orderNumber: kot.orderNumber,
        tableNumber: kot.tableNumber,
        items: kot.items,
        specialInstructions: kot.specialInstructions,
        date: new Date(kot.createdAt),
      });

      // Update print count
      await fetch('/api/kitchen/kots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kotId: kot._id,
          printCount: (kot.printCount || 0) + 1,
        }),
      });

      console.log('KOT printed:', kot._id);
    } catch (error) {
      console.error('Error printing KOT:', error);
    }
  };

  const updateKOTStatus = async (kotId: string, newStatus: string) => {
    try {
      await fetch('/api/kitchen/kots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kotId,
          status: newStatus,
        }),
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === kotId ? { ...n, status: newStatus as any } : n
        )
      );
    } catch (error) {
      console.error('Error updating KOT status:', error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Online Status Indicator */}
      {!isOnline && (
        <div className="mb-2 px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full text-center">
          📡 Offline Mode - Data saved locally
        </div>
      )}

      {/* Notification Bell Button */}
      <button
        onClick={() => setShowNotificationPanel(!showNotificationPanel)}
        className="relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition"
        title="Kitchen Orders"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showNotificationPanel && (
        <div className="absolute bottom-20 right-0 w-full max-w-md max-h-96 bg-white border-2 border-blue-200 rounded-lg shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Kitchen Orders</h3>
              <p className="text-xs text-blue-100">{notifications.length} total</p>
            </div>
            <button
              onClick={() => setShowNotificationPanel(false)}
              className="hover:bg-blue-800 p-1 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 bg-slate-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="font-medium">No pending KOTs</p>
                <p className="text-xs mt-1">Orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`rounded-lg p-3 border-l-4 transition ${
                      notif.read
                        ? 'bg-slate-100 border-l-slate-400'
                        : `border-l-red-600 ${
                            notif.status === 'pending'
                              ? 'bg-red-50'
                              : notif.status === 'preparing'
                              ? 'bg-yellow-50'
                              : notif.status === 'ready'
                              ? 'bg-emerald-50'
                              : 'bg-white'
                          }`
                    }`}
                    onClick={() => markAsRead(notif._id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">
                          Table {notif.tableNumber || 'Walk-in'} • Order #{notif.orderNumber}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </p>
                        <div className="mt-1">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              notif.status === 'pending'
                                ? 'bg-red-200 text-red-800'
                                : notif.status === 'preparing'
                                ? 'bg-yellow-200 text-yellow-800'
                                : notif.status === 'ready'
                                ? 'bg-emerald-200 text-emerald-800'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {notif.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notif._id);
                        }}
                        className="text-slate-400 hover:text-slate-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Items List */}
                    <div className="bg-white p-2 rounded border border-slate-200 mb-2">
                      <ul className="text-sm text-slate-700 space-y-1">
                        {notif.items.map((item, i) => (
                          <li key={i} className="flex justify-between">
                            <span>• {item.name}</span>
                            <span className="font-semibold">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      {notif.specialInstructions && (
                        <p className="text-xs italic text-slate-600 mt-2 pt-2 border-t border-slate-200">
                          Note: {notif.specialInstructions}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          printKOTTicket(notif);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 rounded transition"
                      >
                        <Printer size={14} /> Print
                      </button>
                      {notif.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateKOTStatus(notif._id, 'preparing');
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold py-2 rounded transition"
                        >
                          🔥 Preparing
                        </button>
                      )}
                      {notif.status === 'preparing' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateKOTStatus(notif._id, 'ready');
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded transition"
                        >
                          <Check size={14} /> Ready
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-100 p-3 text-center text-xs text-slate-600 font-medium">
              {unreadCount} pending • {notifications.filter((n) => n.status === 'ready').length} ready
            </div>
          )}
        </div>
      )}
    </div>
  );
}
