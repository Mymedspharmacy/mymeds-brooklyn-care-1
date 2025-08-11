import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { getBackendUrl } from '@/lib/env';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: string;
  createdAt: string;
}

export function useNotifications(soundEnabled: boolean = true) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  
  // ✅ ADDED: Audio reference for notification sound
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // ✅ ADDED: Initialize audio element for notification sound
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5; // Set volume to 50%
    
    const newSocket = io(getBackendUrl());
    
    newSocket.on('connect', () => {
      console.log('Connected to notifications');
      setIsConnected(true);
      newSocket.emit('join-admin');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notifications');
      setIsConnected(false);
    });

    newSocket.on('new-notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // ✅ ADDED: Play notification sound only if enabled
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(err => {
          console.log('Could not play notification sound:', err);
        });
      }
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'PAYMENT' ? 'default' : 
                notification.type === 'INVENTORY' ? 'destructive' : 'default'
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [toast, soundEnabled]); // ✅ ADDED: soundEnabled to dependency array

  const joinUserRoom = (userId: number) => {
    if (socket) {
      socket.emit('join-user', userId);
    }
  };

  const leaveUserRoom = (userId: number) => {
    if (socket) {
      socket.leave(`user-${userId}`);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  return {
    socket,
    notifications,
    isConnected,
    joinUserRoom,
    leaveUserRoom,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    getUnreadCount
  };
} 