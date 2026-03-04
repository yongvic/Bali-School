'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertTriangle, Info, CircleCheckBig } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  date: string;
}

export default function NotificationsPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const [items, setItems] = useState<NotificationItem[]>([]);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) return;
      const data = await response.json();
      setItems(data.items || []);
    };

    fetchNotifications();
  }, []);

  const iconFor = (type: NotificationItem['type']) => {
    if (type === 'success') return <CircleCheckBig className="w-4 h-4 text-green-600" />;
    if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    return <Info className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="page-shell p-4 sm:p-6">
      <div className="page-container-md stack-compact">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="page-title">Notifications</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique récent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune notification pour le moment.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-border flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                  {iconFor(item.type)}
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{new Date(item.date).toLocaleString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
