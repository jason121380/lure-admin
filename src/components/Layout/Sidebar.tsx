import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Department = {
  id: string;
  code: string;
  name: string;
};

interface SidebarProps {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
}

export default function Sidebar({ sidebarVisible, setSidebarVisible }: SidebarProps) {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptCode, setEditDeptCode] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [targetDepartment, setTargetDepartment] = useState("");
  const [showAddDeptDialog, setShowAddDeptDialog] = useState(false);
  const [showEditDeptDialog, setShowEditDeptDialog] = useState(false);
  const [showDeleteDeptDialog, setShowDeleteDeptDialog] = useState(false);
  const [showBulkChangeDialog, setShowBulkChangeDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        toast({
          title: "獲取部門失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setDepartments(data || []);
      }
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message || "獲取部門時發生錯誤",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDeptName || !newDeptCode) {
      toast({
        title: "錯誤",
        description: "請填寫部門名稱和代碼。",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("departments")
        .insert([{ name: newDeptName, code: newDeptCode }]);

      if (error) {
        toast({
          title: "新增部門失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "新增部門成功",
          description: "部門已成功新增。",
        });
        setNewDeptName("");
        setNewDeptCode("");
        setShowAddDeptDialog(false);
        fetchDepartments();
      }
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message || "新增部門時發生錯誤",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDepartment = async () => {
    if (!selectedDepartment || !editDeptName || !editDeptCode) {
      toast({
        title: "錯誤",
        description: "請選擇要編輯的部門並填寫名稱和代碼。",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("departments")
        .update({ name: editDeptName, code: editDeptCode })
        .eq("id", selectedDepartment.id);

      if (error) {
        toast({
          title: "更新部門失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "更新部門成功",
          description: "部門已成功更新。",
        });
        setEditDeptName("");
        setEditDeptCode("");
        setShowEditDeptDialog(false);
        fetchDepartments();
      }
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message || "更新部門時發生錯誤",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) {
      toast({
        title: "錯誤",
        description: "請選擇要刪除的部門。",
        variant: "destructive",
      });
      return;
    }

    try {
      // Move customers to 'uncategorized' department
      const { error: updateError } = await supabase
        .from("customers")
        .update({ department: 'uncategorized', departmentName: '未分類' })
        .eq("department", selectedDepartment.code);

      if (updateError) {
        toast({
          title: "更新客戶部門失敗",
          description: updateError.message,
          variant: "destructive",
        });
        return;
      }

      // Delete the department
      const { error: deleteError } = await supabase
        .from("departments")
        .delete()
        .eq("id", selectedDepartment.id);

      if (deleteError) {
        toast({
          title: "刪除部門失敗",
          description: deleteError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "刪除部門成功",
          description: "部門已成功刪除，相關客戶已移動到'未分類'。",
        });
        setShowDeleteDeptDialog(false);
        fetchDepartments();
      }
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message || "刪除部門時發生錯誤",
        variant: "destructive",
      });
    }
  };

  const handleBulkDepartmentChange = async () => {
    if (!targetDepartment) {
      toast({
        title: "錯誤",
        description: "請選擇目標部門。",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDepartment) {
        toast({
          title: "錯誤",
          description: "請選擇要移動的客戶。",
          variant: "destructive",
        });
        return;
      }

    try {
      // Fetch the target department to get its name
      const { data: targetDeptData, error: targetDeptError } = await supabase
        .from("departments")
        .select("name")
        .eq("code", targetDepartment)
        .single(); // Assuming department codes are unique

      if (targetDeptError) {
        throw targetDeptError;
      }

      if (!targetDeptData) {
        throw new Error("目標部門不存在。");
      }

      const { error } = await supabase
        .from("customers")
        .update({ department: targetDepartment, departmentName: targetDeptData.name })
        .eq("department", selectedDepartment.code);

      if (error) {
        toast({
          title: "批量更改部門失敗",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "批量更改部門成功",
          description: "所選客戶已成功移動到新部門。",
        });
        setShowBulkChangeDialog(false);
        fetchDepartments();
      }
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message || "批量更改部門時發生錯誤",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100 p-4 ${
          sidebarVisible ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <button
          onClick={() => setSidebarVisible(false)}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          關閉
        </button>

        <h2 className="text-2xl font-semibold mb-4">部門管理</h2>

        <Button onClick={() => setShowAddDeptDialog(true)} className="mb-4">
          新增部門
        </Button>

        <ul>
          {loading ? (
            <li>載入中...</li>
          ) : (
            departments.map((dept) => (
              <li
                key={dept.id}
                className={`mb-2 p-2 rounded ${
                  selectedDepartment?.id === dept.id ? "bg-blue-200" : "hover:bg-gray-200"
                } cursor-pointer`}
                onClick={() => setSelectedDepartment(dept)}
              >
                {dept.name}
              </li>
            ))
          )}
        </ul>

        <div className="mt-4">
          <Button
            onClick={() => {
              if (selectedDepartment) {
                setEditDeptName(selectedDepartment.name);
                setEditDeptCode(selectedDepartment.code);
                setShowEditDeptDialog(true);
              } else {
                toast({
                  title: "錯誤",
                  description: "請先選擇一個部門。",
                  variant: "destructive",
                });
              }
            }}
            disabled={!selectedDepartment}
            className="w-full mb-2"
          >
            編輯部門
          </Button>

          <Button
            onClick={() => {
              if (selectedDepartment) {
                setShowDeleteDeptDialog(true);
              } else {
                toast({
                  title: "錯誤",
                  description: "請先選擇一個部門。",
                  variant: "destructive",
                });
              }
            }}
            disabled={!selectedDepartment}
            variant="destructive"
            className="w-full mb-2"
          >
            刪除部門
          </Button>

          <Button
            onClick={() => {
              if (selectedDepartment) {
                setShowBulkChangeDialog(true);
              } else {
                toast({
                  title: "錯誤",
                  description: "請先選擇一個部門。",
                  variant: "destructive",
                });
              }
            }}
            disabled={!selectedDepartment}
            className="w-full"
          >
            批量更改部門
          </Button>
        </div>
      </aside>

      {/* Add Department Dialog */}
      <Dialog open={showAddDeptDialog} onOpenChange={setShowAddDeptDialog}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>新增部門</DialogTitle>
            <DialogDescription>
              請輸入新部門的資訊。部門代碼將用於系統內部識別。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                部門名稱
              </Label>
              <Input
                id="name"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="col-span-3"
                placeholder="請輸入部門名稱"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                部門代碼
              </Label>
              <Input
                id="code"
                value={newDeptCode}
                onChange={(e) => setNewDeptCode(e.target.value)}
                className="col-span-3"
                placeholder="請輸入部門代碼"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddDepartment}>
              新增部門
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={showEditDeptDialog} onOpenChange={setShowEditDeptDialog}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>編輯部門</DialogTitle>
            <DialogDescription>
              修改部門資訊。請注意，部門代碼變更可能會影響現有客戶的分類。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                部門名稱
              </Label>
              <Input
                id="edit-name"
                value={editDeptName}
                onChange={(e) => setEditDeptName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                部門代碼
              </Label>
              <Input
                id="edit-code"
                value={editDeptCode}
                onChange={(e) => setEditDeptCode(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateDepartment}>
              更新部門
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog open={showDeleteDeptDialog} onOpenChange={setShowDeleteDeptDialog}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>刪除部門</DialogTitle>
            <DialogDescription>
              您確定要刪除此部門嗎？此操作無法撤銷，該部門下的所有客戶將被移動到"未分類"。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDeptDialog(false)}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteDepartment}>
              刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Department Change Dialog */}
      <Dialog open={showBulkChangeDialog} onOpenChange={setShowBulkChangeDialog}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>批量更改部門</DialogTitle>
            <DialogDescription>
              選擇要將所選客戶移動到的新部門。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target-department" className="text-right">
                目標部門
              </Label>
              <Select
                value={targetDepartment}
                onValueChange={setTargetDepartment}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="選擇部門" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.code}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkChangeDialog(false)}
            >
              取消
            </Button>
            <Button onClick={handleBulkDepartmentChange}>
              確認更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
