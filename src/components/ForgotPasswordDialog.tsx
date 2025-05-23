
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting password reset process for:", email);
    setIsLoading(true);

    try {
      // Generate reset token with Supabase
      console.log("Calling Supabase resetPasswordForEmail...");
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      console.log("Supabase resetPasswordForEmail result:", { data, error: resetError });

      if (resetError) {
        console.error("Supabase reset error:", resetError);
        toast({
          title: "發送失敗",
          description: resetError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "郵件已發送",
        description: "請檢查您的電子郵件以重設密碼。如果沒收到郵件，請檢查垃圾郵件資料夾。",
      });
      onOpenChange(false);
      setEmail("");

    } catch (error: any) {
      console.error("General error in password reset:", error);
      toast({
        title: "錯誤",
        description: `發送重設郵件時發生錯誤: ${error.message || "未知錯誤"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            忘記密碼
          </DialogTitle>
          <DialogDescription>
            輸入您的電子郵件地址，我們將發送重設密碼的連結給您。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">電子郵件</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading || !email.trim()}>
              {isLoading ? "發送中..." : "發送重設連結"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
