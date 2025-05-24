
import React from 'react';
import { Button } from "@/components/ui/button";
import { Users, List, User } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav = ({ activeTab, setActiveTab }: MobileBottomNavProps) => {
  const navItems = [
    { id: 'management', label: '客戶管理', icon: Users },
    { id: 'list', label: '客戶列表', icon: List },
    { id: 'profile', label: '個人中心', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50 md:hidden">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center px-4 py-3 h-auto rounded-lg transition-all ${
              activeTab === item.id 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className={`w-5 h-5 mb-1 ${
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
