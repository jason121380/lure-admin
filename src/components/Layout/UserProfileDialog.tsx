
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Edit, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfileDialog = ({ open, onOpenChange }: UserProfileDialogProps) => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");

  // Update current user name when user changes or dialog opens
  useEffect(() => {
    if (user && open) {
      const userName = user.user_metadata?.full_name || "";
      setCurrentUserName(userName);
      setEditedName(userName);
    }
  }, [user, open]);

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

  const handleEditName = () => {
    setEditedName(currentUserName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error("請輸入有效的名稱");
      return;
    }

    try {
      setUpdateLoading(true);
      
      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: editedName.trim() }
      });

      if (authError) {
        throw authError;
      }

      // Also update in profiles table if it exists
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: editedName.trim() })
        .eq('id', user?.id);

      // Don't throw error if profiles table doesn't exist or update fails
      if (profileError) {
        console.log("Profile table update failed (may not exist):", profileError);
      }

      // Update local state to reflect the change immediately
      setCurrentUserName(editedName.trim());
      toast.success("名稱已更新");
      setIsEditingName(false);
      
      // Force a small delay to ensure UI updates properly across devices
      setTimeout(() => {
        // Trigger a re-render by updating component state
        setCurrentUserName(editedName.trim());
      }, 100);
      
    } catch (error) {
      toast.error("更新名稱時發生錯誤");
      console.error("Error updating name:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(currentUserName);
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
            <div className="space-y-1 flex-1">
              {isEditingName ? (
                <div className="space-y-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="輸入姓名"
                    className="text-lg font-medium"
                    disabled={updateLoading}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={updateLoading}
                      className="flex items-center space-x-1"
                    >
                      <Check className="h-3 w-3" />
                      <span>{updateLoading ? "儲存中..." : "儲存"}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={updateLoading}
                      className="flex items-center space-x-1"
                    >
                      <X className="h-3 w-3" />
                      <span>取消</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <h3 className="font-medium text-lg">
                  {currentUserName || "使用者"}
                </h3>
              )}
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {!isEditingName && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={handleEditName}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>編輯名稱</span>
              </Button>
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
