import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Customer } from '@/components/CustomerList/CustomerListItem';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';

type DepartmentType = {
  id: string;
  code: string;
  name: string;
};

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
  onSave,
}: CustomerEditDialogProps) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [status, setStatus] = useState('active');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [taxId, setTaxId] = useState('');
  const [departmentsList, setDepartmentsList] = useState<DepartmentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  // Fetch departments from the database
  useEffect(() => {
    if (open) {
      fetchDepartments();

      // Reset form or fill with customer data
      if (customer) {
        setName(customer.name || '');
        setDepartment(customer.department || '');
        setDepartmentName(customer.departmentName || '');
        setStatus(customer.status || 'active');
        setEmail(customer.email || '');
        setPhone(customer.phone || '');
        setAddress(customer.address || '');
        setContact(customer.contact || '');
        setTaxId(customer.taxId || '');
      } else {
        // For new customers, set default values with uncategorized
        setName('');
        setDepartment('uncategorized');
        setDepartmentName('未分類');
        setStatus('active');
        setEmail('');
        setPhone('');
        setAddress('');
        setContact('');
        setTaxId('');
      }
    }
  }, [customer, open]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Filter out the "all" department as it's not a valid selection for a customer
        const filteredDepts = data.filter(dept => dept.code !== 'all');
        // Map database fields to our component structure
        const departments: DepartmentType[] = filteredDepts.map(dept => ({
          id: dept.id,
          code: dept.code,
          name: dept.name
        }));
        
        // Ensure uncategorized department exists in the list
        const hasUncategorized = departments.some(dept => dept.code === 'uncategorized');
        if (!hasUncategorized) {
          departments.unshift({
            id: 'temp-uncategorized',
            code: 'uncategorized',
            name: '未分類'
          });
        }
        
        setDepartmentsList(departments);
      } else {
        // If no departments exist, create a default uncategorized option
        setDepartmentsList([{
          id: 'temp-uncategorized',
          code: 'uncategorized',
          name: '未分類'
        }]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      // Fallback to uncategorized if fetch fails
      setDepartmentsList([{
        id: 'temp-uncategorized',
        code: 'uncategorized',
        name: '未分類'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we have valid department data for new customers
    const finalDepartment = department || 'uncategorized';
    const finalDepartmentName = departmentName || '未分類';
    
    const customerData = {
      name,
      department: finalDepartment,
      departmentName: finalDepartmentName,
      status,
      email,
      phone,
      address,
      contact,
      taxId,
    };

    // Add notification for the action
    if (customer) {
      addNotification('edit', '已更新客戶資訊', name);
    } else {
      addNotification('create', '已新增客戶', name);
    }
    
    onSave(customerData);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    // Find the department name from the list
    const selectedDept = departmentsList.find(dept => dept.code === value);
    if (selectedDept) {
      setDepartmentName(selectedDept.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{customer ? '編輯客戶' : '新增客戶'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm text-gray-700">
                客戶名稱
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="department" className="text-sm text-gray-700">
                部門
              </label>
              <Select
                value={department}
                onValueChange={handleDepartmentChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇部門" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map((dept) => (
                    <SelectItem key={dept.id} value={dept.code}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm text-gray-700">
                狀態
              </label>
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">進行中</SelectItem>
                  <SelectItem value="paused">暫停</SelectItem>
                  <SelectItem value="inactive">終止</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm text-gray-700">
                電話
              </label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contact" className="text-sm text-gray-700">
                聯絡人
              </label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="taxId" className="text-sm text-gray-700">
                統一編號
              </label>
              <Input
                id="taxId"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="address" className="text-sm text-gray-700">
                地址
              </label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">儲存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
