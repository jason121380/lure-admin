
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DeleteFileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  fileName: string;
};

export function DeleteFileDialog({ open, onOpenChange, onConfirm, fileName }: DeleteFileDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (password !== "96962779") {
      setError("請輸入正確的密碼");
      return;
    }
    
    onConfirm();
    setPassword("");
    setError("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setPassword("");
    setError("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認刪除檔案</AlertDialogTitle>
          <AlertDialogDescription>
            您即將刪除檔案：<strong>{fileName}</strong>
            <br />
            此操作無法復原。請輸入密碼以確認刪除。
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label htmlFor="delete-password" className="text-sm font-medium">
            確認密碼
          </Label>
          <Input
            id="delete-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="請輸入密碼"
            className="mt-2"
          />
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>取消</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            確認刪除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
