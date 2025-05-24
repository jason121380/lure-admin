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
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
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

        <Card className="w-full border shadow-sm bg-white">
          <Tabs defaultValue="login" className="w-full">
            {/* Hide tabs for now, only show login */}
            {/*
            <TabsList className={`grid w-full grid-cols-2 h-12 p-1 bg-gray-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <TabsTrigger 
                value="login" 
                className="h-10 font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                <LogIn className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
                登入
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="h-10 font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                <UserPlus className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
                註冊
              </TabsTrigger>
            </TabsList>
            */}

            <TabsContent value="login" className="mt-0">
              <CardHeader className={`${isMobile ? 'pb-2 pt-4 px-4' : 'pb-4'}`}>
                <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-900`}>歡迎回來</CardTitle>
                <CardDescription className="text-gray-600">
                  輸入您的登入資訊以存取您的帳戶
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSignIn}>
                <CardContent className={`space-y-4 ${isMobile ? 'px-4' : ''}`}>
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                      電子郵件
                    </Label>
                    <Input 
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={`${isMobile ? 'h-10' : 'h-11'} bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                      密碼
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`${isMobile ? 'h-10' : 'h-11'} pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500`}
                        required
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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label 
                      htmlFor="remember-me" 
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      記住我
                    </Label>
                  </div>
                  
                  {/* Hide forgot password link */}
                  {/*
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 h-auto text-sm text-blue-600 hover:text-blue-700"
                      onClick={() => setForgotPasswordOpen(true)}
                    >
                      忘記密碼？
                    </Button>
                  </div>
                  */}
                </CardContent>
                
                <CardFooter className={`${isMobile ? 'px-4 pb-4' : ''}`}>
                  <Button 
                    type="submit" 
                    className={`w-full ${isMobile ? 'h-10' : 'h-11'} bg-blue-600 hover:bg-blue-700 text-white`}
                    disabled={isLoading}
                  >
                    {isLoading ? "登入中..." : "登入"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* Hide signup tab content */}
            {/*
            <TabsContent value="signup" className="mt-0">
              <CardHeader className={`${isMobile ? 'pb-2 pt-4 px-4' : 'pb-4'}`}>
                <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-900`}>建立帳戶</CardTitle>
                <CardDescription className="text-gray-600">
                  輸入您的資訊以建立一個新帳戶
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSignUp}>
                <CardContent className={`space-y-4 ${isMobile ? 'px-4' : ''}`}>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                      電子郵件
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className={`${isMobile ? 'h-10' : 'h-11'} bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-full-name" className="text-sm font-medium text-gray-700">
                      全名
                    </Label>
                    <Input
                      id="signup-full-name"
                      type="text"
                      placeholder="您的全名"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      className={`${isMobile ? 'h-10' : 'h-11'} bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500`}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                      密碼
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className={`${isMobile ? 'h-10' : 'h-11'} pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`absolute right-0 top-0 ${isMobile ? 'h-10' : 'h-11'} w-10 hover:bg-gray-100`}
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className={`${isMobile ? 'px-4 pb-4' : ''}`}>
                  <Button 
                    type="submit"
                    className={`w-full ${isMobile ? 'h-10' : 'h-11'} bg-blue-600 hover:bg-blue-700 text-white`}
                    disabled={isLoading}
                  >
                    {isLoading ? "註冊中..." : "註冊"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            */}
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
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
