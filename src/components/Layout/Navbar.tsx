
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  toggleSidebar: () => void;
};

export function Navbar({ toggleSidebar }: NavbarProps) {
  const { user } = useAuth();
  
  // Fetch statistics data (customer count)
  const { data: stats } = useQuery({
    queryKey: ['customerStats'],
    queryFn: async () => {
      const { count } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
      
      return { customerCount: count || 0 };
    },
  });

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "?";
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">開啟部門選單</span>
        </Button>
        
        {/* Brand logo and name */}
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1 rounded-md">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">客戶管理系統</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Statistics */}
        <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          <span>總客戶數: {stats?.customerCount || "載入中..."}</span>
        </div>
        
        {/* User account */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">{user?.email}</p>
            <button 
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              登出
            </button>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
