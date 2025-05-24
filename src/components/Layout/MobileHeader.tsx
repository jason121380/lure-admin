
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Plus, Filter, User, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showLogo?: boolean;
  onAddCustomer?: () => void;
  onFilter?: () => void;
  onUserProfile?: () => void;
  onSearch?: () => void;
}

export const MobileHeader = ({ 
  title, 
  showBackButton, 
  onBack, 
  rightAction, 
  showLogo = false,
  onAddCustomer,
  onFilter,
  onUserProfile,
  onSearch
}: MobileHeaderProps) => {
  const { user } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 md:hidden h-[60px] flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          {showBackButton && onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {showLogo ? (
            <div className="flex items-center p-2">
              <img 
                src="/lovable-uploads/bf4895f7-2032-4f5d-a050-239497c44107.png" 
                alt="Logo" 
                className="h-6 w-auto"
              />
            </div>
          ) : (
            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
          )}
        </div>
        
        {rightAction ? (
          <div className="flex items-center">
            {rightAction}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {showLogo && onSearch && (
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={onSearch}>
                <Search className="h-4 w-4" />
              </Button>
            )}
            {showLogo && onFilter && (
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={onFilter}>
                <Filter className="h-4 w-4" />
              </Button>
            )}
            {showLogo && onAddCustomer && (
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={onAddCustomer}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {user && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-8 w-8" 
                onClick={onUserProfile}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
