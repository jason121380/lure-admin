
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        toast({
          title: "登入失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // If remember me is checked, save email to localStorage
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', loginEmail);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        toast({
          title: "登入成功",
          description: "歡迎回來！",
        });
      }
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message || "登入過程中發生錯誤",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setLoginEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(signupEmail, signupPassword, signupFullName);
      
      if (error) {
        toast({
          title: "註冊失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "註冊成功",
          description: "請檢查您的電子郵件以確認您的帳戶。",
        });
      }
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message || "註冊過程中發生錯誤",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl overflow-hidden">
              <img 
                src="/lovable-uploads/bf4895f7-2032-4f5d-a050-239497c44107.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <Card className="w-full border-slate-200 shadow-sm bg-white">
          <Tabs defaultValue="login" className="w-full">
            <TabsContent value="login" className="mt-0">
              <CardHeader className={`${isMobile ? 'pb-2 pt-4 px-4' : 'pb-4'}`}>
                <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} text-slate-900`}>歡迎回來</CardTitle>
                <CardDescription className="text-slate-600">
                  輸入您的登入資訊以存取您的帳戶
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSignIn}>
                <CardContent className={`space-y-4 ${isMobile ? 'px-4' : ''}`}>
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                      電子郵件
                    </Label>
                    <Input 
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={`${isMobile ? 'h-10' : 'h-11'} bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500`}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                      密碼
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`${isMobile ? 'h-10' : 'h-11'} pr-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`absolute right-0 top-0 ${isMobile ? 'h-10' : 'h-11'} w-10 hover:bg-slate-100`}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label 
                      htmlFor="remember-me" 
                      className="text-sm text-slate-700 cursor-pointer"
                    >
                      記住我
                    </Label>
                  </div>
                </CardContent>
                
                <CardFooter className={`${isMobile ? 'px-4 pb-4' : ''}`}>
                  <Button 
                    type="submit" 
                    className={`w-full ${isMobile ? 'h-10' : 'h-11'} bg-slate-900 hover:bg-slate-800 text-white`}
                    disabled={isLoading}
                  >
                    {isLoading ? "登入中..." : "登入"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500">
          <p>© 2025 by Lure</p>
        </div>
      </div>

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </div>
  );
}
