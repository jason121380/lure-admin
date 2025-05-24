
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfileDialog = ({ open, onOpenChange }: UserProfileDialogProps) => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      toast.success("已成功登出");
      onOpenChange(false);
    } catch (error) {
      toast.error("登出時發生錯誤");
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>個人資料</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-medium text-lg">
                {user.user_metadata?.full_name || "使用者"}
              </h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">帳戶類型：</span>
              <span className="text-gray-600 ml-2">一般使用者</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">註冊時間：</span>
              <span className="text-gray-600 ml-2">
                {new Date(user.created_at).toLocaleDateString('zh-TW')}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{loading ? "登出中..." : "登出"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
