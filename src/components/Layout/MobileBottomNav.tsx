
import React from 'react';
import { Button } from "@/components/ui/button";
import { Home, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MobileBottomNavProps {
  activeDepartment: string;
  setActiveDepartment: (department: string) => void;
  onAddCustomer: () => void;
}

export const MobileBottomNav = ({ activeDepartment, setActiveDepartment, onAddCustomer }: MobileBottomNavProps) => {
  const { signOut } = useAuth();

  const navItems = [
    { id: 'all', label: '全部', icon: Home },
    { id: 'sales', label: '業務', icon: Users },
    { id: 'support', label: '客服', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeDepartment === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveDepartment(item.id)}
              className="flex flex-col items-center px-3 py-2 h-auto"
            >
              <item.icon className="h-4 w-4 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={onAddCustomer}
            size="sm"
            className="flex flex-col items-center px-3 py-2 h-auto bg-blue-600 hover:bg-blue-700"
          >
            <Users className="h-4 w-4 mb-1" />
            <span className="text-xs">新增</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="flex flex-col items-center px-3 py-2 h-auto text-red-600"
          >
            <LogOut className="h-4 w-4 mb-1" />
            <span className="text-xs">登出</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
