
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

// Try to import Chinese locale, fallback to undefined if not available
let zhTW;
try {
  zhTW = require("date-fns/locale/zh-TW").zhTW;
} catch {
  try {
    zhTW = require("date-fns/locale/zh-tw").zhTW;
  } catch {
    zhTW = undefined;
  }
}

interface Notification {
  id: string;
  type: 'edit' | 'upload' | 'delete' | 'create';
  message: string;
  timestamp: Date;
  customerName?: string;
  isRead: boolean;
}

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
}

export const NotificationDialog = ({ 
  open, 
  onOpenChange, 
  notifications, 
  onMarkAllAsRead 
}: NotificationDialogProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'edit': return 'bg-blue-100 text-blue-800';
      case 'upload': return 'bg-green-100 text-green-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'create': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'edit': return '編輯';
      case 'upload': return '上傳';
      case 'delete': return '刪除';
      case 'create': return '新增';
      default: return '操作';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>通知</DialogTitle>
            {unreadNotifications.length > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                全部設為已讀
              </button>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暫無通知
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border ${
                    notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getTypeColor(notification.type)}`}
                        >
                          {getTypeText(notification.type)}
                        </Badge>
                        {notification.customerName && (
                          <span className="text-xs text-gray-600">
                            {notification.customerName}
                          </span>
                        )}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(notification.timestamp, { 
                      addSuffix: true, 
                      locale: zhTW 
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
