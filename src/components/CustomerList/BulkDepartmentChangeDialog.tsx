
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

      // Add uncategorized option only if it doesn't exist in the data
      const hasUncategorized = data?.some(dept => dept.code === 'uncategorized');
      
      const departmentOptions: Department[] = [];
      
      if (!hasUncategorized) {
        departmentOptions.push({ code: 'uncategorized', name: '未分類' });
      }
      
      // Add all other departments
      departmentOptions.push(...(data || []));
      
      setDepartments(departmentOptions);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedDepartment) return;

    const department = departments.find(d => d.code === selectedDepartment);
    if (!department) return;

    setIsLoading(true);
    try {
      await onConfirm({
        department: department.code,
        departmentName: department.name
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDepartment("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>批量更改部門</DialogTitle>
          <DialogDescription>
            將 {selectedCount} 位客戶的部門更改為指定部門
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            取消
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedDepartment || isLoading}
          >
            {isLoading ? "更新中..." : "確認更改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
