import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Department = {
  code: string;
  name: string;
};

type BulkDepartmentChangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (departmentData: { department: string; departmentName: string }) => Promise<void>;
};

export function BulkDepartmentChangeDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}: BulkDepartmentChangeDialogProps) {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  // Fetch departments when dialog opens
  useEffect(() => {
    if (open && user) {
      fetchDepartments();
    }
  }, [open, user]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('code, name')
        .eq('user_id', user?.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Filter out any "all departments" or similar options and add uncategorized option only if it doesn't exist
      const filteredData = data?.filter(dept => 
        dept.code !== 'all' && 
        dept.name !== '所有部門' && 
        dept.name !== 'All Departments'
      ) || [];

      const hasUncategorized = filteredData.some(dept => dept.code === 'uncategorized');
      
      const departmentOptions: Department[] = [];
      
      if (!hasUncategorized) {
        departmentOptions.push({ code: 'uncategorized', name: '未分類' });
      }
      
      // Add all other departments (excluding any "all departments" options)
      departmentOptions.push(...filteredData);
      
      setDepartments(departmentOptions);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedDepartment) return;
    setShowPasswordStep(true);
  };

  const handleBack = () => {
    setShowPasswordStep(false);
    setPassword("");
    setPasswordError(false);
  };

  const handleConfirm = async () => {
    if (password === '96962779') {
      const department = departments.find(d => d.code === selectedDepartment);
      if (!department) return;

      setIsLoading(true);
      try {
        await onConfirm({
          department: department.code,
          departmentName: department.name
        });
        handleClose();
      } finally {
        setIsLoading(false);
      }
    } else {
      setPasswordError(true);
    }
  };

  const handleClose = () => {
    setSelectedDepartment("");
    setShowPasswordStep(false);
    setPassword("");
    setPasswordError(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>批量更改部門</DialogTitle>
          <DialogDescription>
            {!showPasswordStep 
              ? `將 ${selectedCount} 位客戶的部門更改為指定部門`
              : "請輸入密碼進行確認"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!showPasswordStep ? (
            <div className="space-y-2">
              <Label htmlFor="department">選擇部門</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇部門" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.code} value={dept.code}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                className={cn(passwordError && "border-red-500")}
              />
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">密碼錯誤，請重新輸入</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {!showPasswordStep ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                取消
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!selectedDepartment || isLoading}
              >
                下一步
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                返回
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={!password || isLoading}
              >
                {isLoading ? "更新中..." : "確認更改"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
