
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LURE CRM</h1>
          <p className="text-gray-600">客戶關係管理系統</p>
        </div>

        <Card className="border-0 shadow-lg mx-auto w-full">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-gray-100">
              <TabsTrigger 
                value="login" 
                className="h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                登入
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                註冊
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">歡迎回來</CardTitle>
                <CardDescription>
                  輸入您的登入資訊以存取您的帳戶
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">
                      電子郵件
                    </Label>
                    <Input 
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">
                      密碼
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-11 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent"
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
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "登入中..." : "登入"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">建立新帳戶</CardTitle>
                <CardDescription>
                  填寫以下資訊以建立您的帳戶
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname" className="text-sm font-medium">
                      全名
                    </Label>
                    <Input
                      id="signup-fullname"
                      placeholder="張小明"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">
                      電子郵件
                    </Label>
                    <Input 
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">
                      密碼
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="h-11 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "建立帳戶中..." : "建立帳戶"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 LURE CRM. 版權所有.</p>
        </div>
      </div>
    </div>
  );
}
