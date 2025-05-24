
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, LogOut, Settings } from "lucide-react";
import { MobileHeader } from "../Layout/MobileHeader";

export const ProfilePage = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="個人中心" />
      
      <div className="pt-16 pb-20 px-4">
        {/* User Profile Card */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-lg text-gray-900">
              {user?.user_metadata?.full_name || '用戶'}
            </CardTitle>
            <div className="flex items-center justify-center text-sm text-gray-500 mt-2">
              <Mail className="w-4 h-4 mr-2" />
              {user?.email}
            </div>
          </CardHeader>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className="w-full justify-start p-4 h-auto text-left"
              >
                <User className="w-5 h-5 mr-3 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">個人資料</div>
                  <div className="text-sm text-gray-500">查看和編輯個人資訊</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className="w-full justify-start p-4 h-auto text-left"
              >
                <Settings className="w-5 h-5 mr-3 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">設定</div>
                  <div className="text-sm text-gray-500">應用程式設定</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start p-4 h-auto text-left text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">登出</div>
                  <div className="text-sm opacity-70">登出您的帳戶</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
