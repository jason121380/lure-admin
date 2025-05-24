
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ProfilePage = () => {
  const { user, signOut } = useAuth();

  const menuItems = [
    {
      icon: User,
      label: '個人資料',
      action: () => {
        // TODO: Implement profile editing
      }
    },
    {
      icon: Settings,
      label: '設定',
      action: () => {
        // TODO: Implement settings
      }
    },
    {
      icon: HelpCircle,
      label: '幫助與支援',
      action: () => {
        // TODO: Implement help
      }
    }
  ];

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">個人中心</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* User Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.email?.split('@')[0] || '用戶'}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-start p-5 h-auto rounded-none ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
              onClick={item.action}
            >
              <item.icon className="w-5 h-5 mr-4 text-gray-500" />
              <span className="text-lg text-gray-900">{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <Button
            variant="ghost"
            className="w-full justify-start p-5 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5 mr-4" />
            <span className="text-lg">登出</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
