import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Customer } from "../CustomerList/CustomerListItem";

type CustomerEditDialogProps = {
  customer?: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (customer: Partial<Customer>) => void;
};

export function CustomerEditDialog({ 
  customer, 
  open, 
  onOpenChange,
  onSave
}: CustomerEditDialogProps) {
  const isEditing = !!customer;
  
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || {
      name: "",
      department: "uncategorized",
      departmentName: "未分類",
      status: "active",
      email: "",
      phone: "",
      address: "",
      contact: "",
      notes: "",
      taxId: "",
    }
  );
  
  const handleChange = (field: keyof Customer, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
      ...(field === 'department' && {
        departmentName: getDepartmentName(value)
      })
    });
  };
  
  const getDepartmentName = (departmentId: string): string => {
    const departments = {
      internal: "內部開發",
      external: "外部開發",
      digital: "數位行銷",
      alfred: "Alfred",
      jason: "Jason",
      uncategorized: "未分類"
    };
    
    return departments[departmentId as keyof typeof departments] || "未分類";
  };
  
  const handleSubmit = () => {
    onSave(formData);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "編輯客戶" : "新增客戶"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "在下方更新您的客戶資訊"
              : "填寫新客戶的詳細資料"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">客戶名稱</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="輸入客戶名稱"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="department">部門</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => handleChange("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇部門" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">內部開發</SelectItem>
                  <SelectItem value="external">外部開發</SelectItem>
                  <SelectItem value="digital">數位行銷</SelectItem>
                  <SelectItem value="alfred">Alfred</SelectItem>
                  <SelectItem value="jason">Jason</SelectItem>
                  <SelectItem value="uncategorized">未分類</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">狀態</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">進行中</SelectItem>
                  <SelectItem value="paused">暫停</SelectItem>
                  <SelectItem value="inactive">不活躍</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="contact">聯絡人</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => handleChange("contact", e.target.value)}
              placeholder="聯絡人姓名"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="電子郵件地址"
                type="email"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">電話</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="電話號碼"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="taxId">統一編號</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => handleChange("taxId", e.target.value)}
              placeholder="請輸入統一編號"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">地址</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="公司地址"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">備註</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="其他附加資訊"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "儲存變更" : "新增客戶"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
