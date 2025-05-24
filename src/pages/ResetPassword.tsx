import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    const initializeResetPassword = async () => {
      try {
        console.log("Initializing reset password page...");
        console.log("URL search params:", window.location.search);
        
        // Check if we have hash params (common in Supabase auth flows)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = searchParams;
        
        // Look for access_token and type in either hash or query params
        const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
        const type = hashParams.get('type') || urlParams.get('type');
        
        console.log("Access token found:", !!accessToken);
        console.log("Type:", type);
        
        if (accessToken && type === 'recovery') {
          console.log("Found recovery token, setting session...");
          
          // Set the session using the access token
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || urlParams.get('refresh_token') || '',
          });
          
          if (error) {
            console.error("Error setting session:", error);
            throw error;
          }
          
          if (data.session) {
            console.log("Session set successfully");
            setInitialized(true);
          } else {
            throw new Error("無法建立重設密碼工作階段");
          }
        } else {
          // Check if user is already authenticated (direct navigation)
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log("User already authenticated");
            setInitialized(true);
          } else {
            throw new Error("無效的重設連結，請重新申請密碼重設。");
          }
        }
        
      } catch (err: any) {
        console.error("Error initializing reset password:", err);
        setError(err.message || "重設連結無效或已過期，請重新申請。");
        setShowErrorDialog(true);
      }
    };
    
    initializeResetPassword();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "密碼不匹配",
        description: "請確認兩次輸入的密碼相同。",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "密碼太短",
        description: "密碼必須至少 6 個字符。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Updating password...");
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });
      
      console.log("Password update result:", { data, error });

      if (error) {
        toast({
          title: "重設失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "密碼重設成功",
          description: "您的密碼已成功更新，正在導向登入頁面...",
        });
        
        // Sign out and redirect to auth page
        await supabase.auth.signOut();
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "錯誤",
        description: error.message || "重設密碼時發生錯誤",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Error dialog handler
  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
    navigate("/auth");
  };

  // If there's an error, show an error dialog
  if (showErrorDialog) {
    return (
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>重設連結無效</AlertDialogTitle>
            <AlertDialogDescription>
              {error || "密碼重設連結已過期或無效，請重新申請。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseErrorDialog}>
              返回登入頁面
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // If not initialized yet, show a loading state
  if (!initialized) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">驗證重設連結中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center p-2">
            <div className="w-full h-full flex items-center justify-center rounded-2xl overflow-hidden">
              <img 
                src="/lovable-uploads/bf4895f7-2032-4f5d-a050-239497c44107.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <Card className="w-full border shadow-sm bg-white">
          <CardHeader className={`${isMobile ? 'pb-2 pt-4 px-4' : 'pb-4'}`}>
            <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-900`}>重設密碼</CardTitle>
            <CardDescription className="text-gray-600">
              請輸入您的新密碼
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className={`space-y-4 ${isMobile ? 'px-4' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  新密碼
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${isMobile ? 'h-10' : 'h-11'} pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500`}
                    placeholder="請輸入新密碼"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute right-0 top-0 ${isMobile ? 'h-10' : 'h-11'} w-10 hover:bg-gray-100`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                  確認新密碼
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${isMobile ? 'h-10' : 'h-11'} pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500`}
                    placeholder="請再次輸入新密碼"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`absolute right-0 top-0 ${isMobile ? 'h-10' : 'h-11'} w-10 hover:bg-gray-100`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardContent className={`pt-0 ${isMobile ? 'px-4' : ''}`}>
              <Button 
                type="submit" 
                className={`w-full ${isMobile ? 'h-10' : 'h-11'} bg-blue-600 hover:bg-blue-700 text-white mb-4`}
                disabled={isLoading}
              >
                {isLoading ? "更新中..." : "更新密碼"}
              </Button>
              
              <div className="text-center">
                <Button 
                  type="button"
                  variant="link"
                  onClick={() => navigate("/auth")}
                  className="px-0 h-auto text-sm text-blue-600 hover:text-blue-700"
                >
                  返回登入頁面
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2025 by Lure</p>
        </div>
      </div>
    </div>
  );
}
