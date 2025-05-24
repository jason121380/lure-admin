
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: { status: string; department: string }) => void;
  currentFilters: { status: string; department: string };
}

interface Department {
  code: string;
  name: string;
}

export const FilterDialog = ({ 
  open, 
  onOpenChange, 
  onApplyFilters, 
  currentFilters 
}: FilterDialogProps) => {
  const [statusFilter, setStatusFilter] = useState(currentFilters.status);
  const [departmentFilter, setDepartmentFilter] = useState(currentFilters.department);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Status options from the database
  const statusOptions = [
    { value: "all", label: "所有狀態" },
    { value: "active", label: "進行中" },
    { value: "paused", label: "暫停" },
    { value: "inactive", label: "終止" }
  ];

  // Fetch departments from database
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('departments')
          .select('code, name')
          .neq('code', 'all')
          .order('sort_order', { ascending: true });

        if (error) {
          throw error;
        }

        setDepartments(data || []);
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("無法載入部門資料");
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchDepartments();
    }
  }, [open]);

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
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">部門</label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "載入中..." : "選擇部門"} />
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
