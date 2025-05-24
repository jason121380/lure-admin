
import React from 'react';
import { Button } from "@/components/ui/button";
import { Users, List, User } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav = ({ activeTab, setActiveTab }: MobileBottomNavProps) => {
  const navItems = [
    { id: 'customers', label: '客戶管理', icon: Users },
    { id: 'list', label: '客戶列表', icon: List },
    { id: 'profile', label: '個人中心', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center px-4 py-3 h-auto min-w-0 ${
              activeTab === item.id 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <item.icon className={`h-5 w-5 mb-1 ${
              activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
            }`} />
            <span className={`text-xs font-medium ${
              activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {item.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
