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
import { zhTW } from "date-fns/locale/zh-TW";

interface Notification {
  id: string;
  type: 'edit' | 'upload' | 'delete' | 'create';
  message: string;
  timestamp: Date;
  customerName?: string;
}

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  onClearAll: () => void;
}

export const NotificationDialog = ({ 
  open, 
  onOpenChange, 
  notifications, 
  onClearAll 
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>通知</DialogTitle>
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                清除全部
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
                  className="p-3 bg-gray-50 rounded-lg border"
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
