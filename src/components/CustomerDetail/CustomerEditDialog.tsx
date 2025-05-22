
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
import { Textarea } from '@/components/ui/textarea';
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

type DepartmentType = {
  id: string;
  name: string;
};

const initialDepartments: DepartmentType[] = [
  { id: 'all', name: '所有部門' },
  { id: 'external', name: '發展 對外' },
  { id: 'internal', name: '發展 對內' },
  { id: 'digital', name: '數位行銷' },
  { id: 'alfred', name: 'Alfred' },
  { id: 'jason', name: 'Jason' },
  { id: 'uncategorized', name: '未分類' }
];

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
  const [notes, setNotes] = useState('');
  const [departmentsList, setDepartmentsList] = useState<DepartmentType[]>(initialDepartments.filter(dept => dept.id !== 'all'));

  // Fetch departments from the database or use local state
  useEffect(() => {
    if (open) {
      // Get departments from localStorage if available
      const storedDepartments = localStorage.getItem('departmentsList');
      if (storedDepartments) {
        try {
          const parsedDepartments = JSON.parse(storedDepartments);
          // Filter out the "all" department
          setDepartmentsList(parsedDepartments.filter((dept: DepartmentType) => dept.id !== 'all'));
        } catch (e) {
          console.error("Error parsing departments from localStorage", e);
        }
      }

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
        setNotes(customer.notes || '');
      } else {
        setName('');
        setDepartment('uncategorized');
        setDepartmentName('未分類');
        setStatus('active');
        setEmail('');
        setPhone('');
        setAddress('');
        setContact('');
        setTaxId('');
        setNotes('');
      }
    }
  }, [customer, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      department,
      departmentName,
      status,
      email,
      phone,
      address,
      contact,
      taxId,
      notes,
    });
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    // Find the department name from the list
    const selectedDept = departmentsList.find(dept => dept.id === value);
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
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇部門" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
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
                  <SelectItem value="active">活躍</SelectItem>
                  <SelectItem value="paused">暫停</SelectItem>
                  <SelectItem value="inactive">非活躍</SelectItem>
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

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="notes" className="text-sm text-gray-700">
                備註
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
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
