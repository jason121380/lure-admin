
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if we have the necessary tokens
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    console.log("Tokens from URL:", { accessToken, refreshToken });
    
    if (!accessToken || !refreshToken) {
      toast({
        title: "無效的重設連結",
        description: "請重新申請密碼重設。",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Set the session with the tokens
    const setSessionAsync = async () => {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        console.log("Session set result:", { data, error });
        
        if (error) {
          toast({
            title: "設定會話失敗",
            description: error.message,
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
        
        setInitialized(true);
      } catch (err) {
        console.error("Error setting session:", err);
        toast({
          title: "設定會話失敗",
          description: "請重新申請密碼重設。",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    
    setSessionAsync();
  }, [searchParams, navigate, toast]);

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
          description: "您的密碼已成功更新。",
        });
        
        // Wait a bit before navigating to allow the user to see the success message
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

  // If not initialized yet, show a loading state
  if (!initialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">驗證中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl overflow-hidden">
              <img 
                src="/lovable-uploads/bf4895f7-2032-4f5d-a050-239497c44107.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">重設密碼</h1>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">設定新密碼</CardTitle>
            <CardDescription>
              請輸入您的新密碼
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">新密碼</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">確認新密碼</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardContent className="pt-0">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "更新中..." : "更新密碼"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
