
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showLogo?: boolean;
  onSearchClick?: () => void;
}

export const MobileHeader = ({ 
  title, 
  showBackButton, 
  onBack, 
  rightAction, 
  showLogo = false,
  onSearchClick 
}: MobileHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-40 md:hidden">
      <div className="flex items-center justify-between">
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
          showLogo && onSearchClick && (
            <Button variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={onSearchClick}>
              <Search className="h-4 w-4" />
            </Button>
          )
        )}
      </div>
    </div>
  );
};
