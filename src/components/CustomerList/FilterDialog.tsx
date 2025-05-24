
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: { status: string; department: string }) => void;
  currentFilters: { status: string; department: string };
}

export const FilterDialog = ({ 
  open, 
  onOpenChange, 
  onApplyFilters, 
  currentFilters 
}: FilterDialogProps) => {
  const [statusFilter, setStatusFilter] = useState(currentFilters.status);
  const [departmentFilter, setDepartmentFilter] = useState(currentFilters.department);

  const handleClear = () => {
    setStatusFilter("all");
    setDepartmentFilter("all");
  };

  const handleApply = () => {
    onApplyFilters({
      status: statusFilter,
      department: departmentFilter
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>篩選客戶</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">狀態</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="選擇狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有狀態</SelectItem>
                <SelectItem value="active">進行中</SelectItem>
                <SelectItem value="paused">暫停</SelectItem>
                <SelectItem value="inactive">終止</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">部門</label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="選擇部門" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有部門</SelectItem>
                <SelectItem value="sales">業務部門</SelectItem>
                <SelectItem value="support">客服部門</SelectItem>
                <SelectItem value="marketing">行銷部門</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClear}>
              清除
            </Button>
            <Button onClick={handleApply}>
              套用
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
